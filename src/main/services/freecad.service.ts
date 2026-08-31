import { spawn } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { freeCadInputSchema, freeCadOutputSchema } from '../../shared/schemas/freecad.schema';
import type { FreeCadInput, FreeCadOutput, FreeCadStatus } from '../../shared/types/render.types';
import { isPathInside } from '../utils/render-paths';

export interface ProcessRunResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface RunProcessOptions {
  timeoutMs?: number;
  cwd?: string;
  env?: NodeJS.ProcessEnv;
}

export function assertSuccessfulProcessResult(result: ProcessRunResult): void {
  if (result.exitCode !== 0) {
    const details = result.stderr.trim() || result.stdout.trim() || 'Sin detalles.';
    throw new Error(`FreeCADCmd finalizó con código ${result.exitCode}: ${details.slice(-1500)}`);
  }
}

export function runProcess(
  executablePath: string,
  args: string[],
  options: RunProcessOptions = {}
): Promise<ProcessRunResult> {
  const timeoutMs = options.timeoutMs ?? 120_000;

  return new Promise((resolve, reject) => {
    const child = spawn(executablePath, args, {
      cwd: options.cwd,
      shell: false,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: options.env
        ? { ...process.env, ...options.env }
        : process.env
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill();
    }, timeoutMs);

    child.stdout.on('data', (chunk: Buffer | string) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer | string) => {
      stderr += chunk.toString();
    });
    child.once('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.once('close', (code) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error(`FreeCADCmd excedió el tiempo límite de ${timeoutMs} ms.`));
        return;
      }
      resolve({ stdout, stderr, exitCode: code ?? -1 });
    });
  });
}

function addFreeCadDirectories(root: string | undefined, executableName: string, result: string[]): void {
  if (!root || !existsSync(root)) return;
  result.push(path.join(root, 'FreeCAD', 'bin', executableName));
  try {
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory() && /^FreeCAD/i.test(entry.name)) {
        result.push(path.join(root, entry.name, 'bin', executableName));
      }
    }
  } catch {
    // La detección automática no debe impedir que SIMBO inicie.
  }
}

export function discoverFreeCadCandidatePaths(
  platform: NodeJS.Platform = process.platform,
  env: NodeJS.ProcessEnv = process.env
): string[] {
  const candidates: string[] = [];

  if (platform === 'win32') {
    addFreeCadDirectories(env.ProgramFiles ?? env.PROGRAMFILES ?? 'C:\\Program Files', 'FreeCADCmd.exe', candidates);
    addFreeCadDirectories(
      env['ProgramFiles(x86)'] ?? env.PROGRAMFILES_X86 ?? 'C:\\Program Files (x86)',
      'FreeCADCmd.exe',
      candidates
    );
    if (env.LOCALAPPDATA) {
      addFreeCadDirectories(path.join(env.LOCALAPPDATA, 'Programs'), 'FreeCADCmd.exe', candidates);
    }
  } else if (platform === 'darwin') {
    candidates.push(
      '/Applications/FreeCAD.app/Contents/Resources/bin/FreeCADCmd',
      path.join(os.homedir(), 'Applications/FreeCAD.app/Contents/Resources/bin/FreeCADCmd')
    );
  } else {
    candidates.push('/usr/bin/FreeCADCmd', '/usr/local/bin/FreeCADCmd', '/snap/bin/freecadcmd');
  }

  return [...new Set(candidates)];
}

export interface ResolveExecutableOptions {
  envPath?: string | null;
  candidatePaths?: string[];
  fileExists?: (candidate: string) => boolean;
}

export function resolveFreeCadExecutable(options: ResolveExecutableOptions = {}): string | null {
  const fileExists = options.fileExists ?? ((candidate: string) => {
    try {
      return existsSync(candidate) && statSync(candidate).isFile();
    } catch {
      return false;
    }
  });

  const envPath = options.envPath?.trim();
  if (envPath) {
    const resolved = path.resolve(envPath);
    return fileExists(resolved) ? resolved : null;
  }

  const candidates = options.candidatePaths ?? discoverFreeCadCandidatePaths();
  return candidates.find((candidate) => fileExists(candidate)) ?? null;
}

export function parseFreeCadOutput(raw: string): FreeCadOutput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(
      'FreeCAD generó un output.json que no contiene JSON válido.'
    );
  }

  if (typeof parsed === 'object' && parsed !== null) {
    const record = parsed as Record<string, unknown>;

    if (record.success === false) {
      const errorMessage =
        typeof record.error === 'string'
          ? record.error.trim()
          : '';

      throw new Error(
        errorMessage
          ? `FreeCAD no pudo generar el modelo CAD: ${errorMessage}`
          : 'FreeCAD reportó un fallo durante la generación CAD sin proporcionar detalles.'
      );
    }
  }

  const result = freeCadOutputSchema.safeParse(parsed);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => {
        const field = issue.path.length > 0
          ? issue.path.join('.')
          : 'root';

        return `${field}: ${issue.message}`;
      })
      .join('; ');

    throw new Error(
      `FreeCAD generó un output.json con una estructura inválida: ${details}`
    );
  }

  return result.data;
}

export interface FreeCadServiceOptions {
  scriptPath: string;
  timeoutMs?: number;
  envPath?: string | null;
  candidatePaths?: string[];
}

export class FreeCadService {
  private readonly timeoutMs: number;

  constructor(private readonly options: FreeCadServiceOptions) {
    this.timeoutMs = options.timeoutMs ?? 120_000;
  }

  async getStatus(): Promise<FreeCadStatus> {
    const envPath = this.options.envPath ?? process.env.FREECAD_CMD_PATH ?? null;
    const executablePath = resolveFreeCadExecutable({
      envPath,
      candidatePaths: this.options.candidatePaths
    });

    if (!executablePath) {
      return {
        available: false,
        executablePath: null,
        version: null,
        message: envPath
          ? 'FREECAD_CMD_PATH no apunta a un ejecutable válido de FreeCADCmd.'
          : 'FreeCAD no está configurado. Configura FreeCADCmd para habilitar la generación CAD.'
      };
    }

    try {
      const result = await runProcess(executablePath, ['--version'], { timeoutMs: 8_000 });
      assertSuccessfulProcessResult(result);
      const versionText = `${result.stdout}\n${result.stderr}`.trim();
      const versionLine = versionText.split(/\r?\n/).find(Boolean) ?? null;
      return {
        available: true,
        executablePath,
        version: versionLine,
        message: versionLine ? `FreeCAD disponible: ${versionLine}` : 'FreeCADCmd está disponible.'
      };
    } catch (error) {
      return {
        available: false,
        executablePath,
        version: null,
        message: error instanceof Error ? `No se pudo ejecutar FreeCADCmd: ${error.message}` : 'No se pudo ejecutar FreeCADCmd.'
      };
    }
  }

  async generateModel(
    input: FreeCadInput,
    workDirectory: string,
    outputDirectory: string
  ): Promise<FreeCadOutput> {
    const validInput = freeCadInputSchema.parse(input);
    const status = await this.getStatus();
    if (!status.available || !status.executablePath) {
      throw new Error(status.message);
    }
    if (!existsSync(this.options.scriptPath)) {
      throw new Error('No se encontró el script Python de generación CAD.');
    }

    await mkdir(workDirectory, { recursive: true });
    await mkdir(outputDirectory, { recursive: true });
    const inputPath = path.join(workDirectory, 'input.json');
    const outputPath = path.join(outputDirectory, 'output.json');
    await writeFile(inputPath, JSON.stringify(validInput, null, 2), 'utf8');

    const processResult = await runProcess(
      status.executablePath,
      [this.options.scriptPath],
      {
        timeoutMs: this.timeoutMs,
        cwd: path.dirname(this.options.scriptPath),
        env: {
          SIMBO_FREECAD_INPUT: inputPath,
          SIMBO_FREECAD_OUTPUT_DIR: outputDirectory,
          SIMBO_FREECAD_AUTORUN: '1'
        }
      }
    );

    assertSuccessfulProcessResult(processResult);
    if (!existsSync(outputPath)) {
      const stdout = processResult.stdout.trim();
      const stderr = processResult.stderr.trim();

      throw new Error(
        [
          'FreeCADCmd finalizó sin generar output.json.',
          stdout ? `STDOUT:\n${stdout}` : '',
          stderr ? `STDERR:\n${stderr}` : ''
        ]
          .filter(Boolean)
          .join('\n\n')
      );
    }

    const output = parseFreeCadOutput(await readFile(outputPath, 'utf8'));
    for (const artifact of [output.files.fcstd, output.files.step, output.files.stl, output.files.obj]) {
      if (!artifact) continue;
      if (!path.isAbsolute(artifact) || !isPathInside(outputDirectory, artifact) || !existsSync(artifact)) {
        throw new Error('FreeCAD reportó un archivo generado inválido o inexistente.');
      }
    }
    return output;
  }
}
