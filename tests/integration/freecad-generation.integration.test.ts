import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { FreeCadService } from '@main/services/freecad.service';

const shouldRun = Boolean(process.env.RUN_FREECAD_INTEGRATION && process.env.FREECAD_CMD_PATH);
const tempDirectories: string[] = [];

const describeFreeCad = shouldRun ? describe : describe.skip;

describeFreeCad('FreeCAD real integration', () => {
  afterAll(async () => {
    await Promise.all(tempDirectories.map((directory) => rm(directory, { recursive: true, force: true })));
  });

  it('generates FCStd, STEP, STL and output.json through FreeCADCmd', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'simbo-freecad-'));
    tempDirectories.push(root);
    const work = path.join(root, 'temp');
    const output = path.join(root, 'cad');
    const service = new FreeCadService({
      scriptPath: path.resolve('freecad/generate_model.py'),
      envPath: process.env.FREECAD_CMD_PATH,
      timeoutMs: 120_000
    });
    const result = await service.generateModel({
      project: { id: 'project_1', name: 'Prueba FreeCAD', units: 'mm' },
      room: { layoutType: 'RECTANGULAR', widthMm: 3000, depthMm: 2500, heightMm: 2400 },
      modules: [{
        id: 'module_1', type: 'BASE_CABINET', name: 'Gabinete', widthMm: 800, heightMm: 720,
        depthMm: 560, positionX: 600, positionY: 0, positionZ: 500, rotationY: 0,
        material: { name: 'MDF 18mm', thicknessMm: 18, colorHex: '#FFFFFF' }
      }]
    }, work, output);
    expect(result.files.fcstd.endsWith('.FCStd')).toBe(true);
    expect(result.files.step.endsWith('.step')).toBe(true);
    expect(result.files.stl.endsWith('.stl')).toBe(true);
  });
});
