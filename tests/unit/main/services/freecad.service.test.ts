import { describe, expect, it } from 'vitest';
import {
  assertSuccessfulProcessResult,
  parseFreeCadOutput,
  resolveFreeCadExecutable,
  runProcess
} from '@main/services/freecad.service';

describe('freecad service utilities', () => {
  it('prefers FREECAD_CMD_PATH when it exists', () => {
    const resolved = resolveFreeCadExecutable({
      envPath: '/custom/FreeCADCmd',
      candidatePaths: ['/fallback/FreeCADCmd'],
      fileExists: (candidate) => candidate === '/custom/FreeCADCmd'
    });
    expect(resolved).toContain('custom');
  });

  it('falls back to detected candidates', () => {
    const resolved = resolveFreeCadExecutable({
      envPath: null,
      candidatePaths: ['/one/FreeCADCmd', '/two/FreeCADCmd'],
      fileExists: (candidate) => candidate === '/two/FreeCADCmd'
    });
    expect(resolved).toBe('/two/FreeCADCmd');
  });

  it('parses a valid output.json payload', () => {
    const parsed = parseFreeCadOutput(JSON.stringify({
      success: true,
      files: { fcstd: '/tmp/model.FCStd', step: '/tmp/model.step', stl: '/tmp/model.stl', obj: null },
      warnings: [],
      generatedAt: '2026-08-31T20:00:00.000Z'
    }));
    expect(parsed.files.obj).toBeNull();
  });

  it('rejects invalid output.json', () => {
    expect(() => parseFreeCadOutput('{not-json')).toThrow('JSON válido');
  });

  it('reports non-zero exit codes clearly', () => {
    expect(() => assertSuccessfulProcessResult({ stdout: '', stderr: 'boom', exitCode: 3 })).toThrow('código 3');
  });

  it('enforces the process timeout without FreeCAD', async () => {
    await expect(
      runProcess(process.execPath, ['-e', 'setTimeout(() => {}, 2000)'], { timeoutMs: 40 })
    ).rejects.toThrow('tiempo límite');
  });
});
