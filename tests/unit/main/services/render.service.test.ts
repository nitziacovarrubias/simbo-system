import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildFreeCadInput, getNextRenderVersion, RenderService } from '@main/services/render.service';
import { FreeCadService } from '@main/services/freecad.service';
import { RenderRepository } from '@main/repositories/render.repository';
import { HistoryRepository } from '@main/repositories/history.repository';
import type { RenderDetailRecord } from '@main/repositories/render.repository';

function createRenderRecord(hasCollision = false): RenderDetailRecord {
  const now = new Date('2026-08-31T20:00:00.000Z');
  return {
    id: 'render_1',
    projectId: 'project_1',
    designId: 'design_1',
    createdById: null,
    title: 'Render cocina',
    version: 1,
    status: 'PRELIMINARY',
    filePath: null,
    thumbnailPath: null,
    format: 'PNG',
    resolutionWidth: 1920,
    resolutionHeight: 1080,
    sizeMb: null,
    viewType: 'ISOMETRIC',
    cameraAngle: null,
    quality: 'HIGH',
    notes: null,
    fcstdPath: null,
    stepPath: null,
    stlPath: null,
    objPath: null,
    generatedAt: now,
    failureMessage: null,
    createdAt: now,
    updatedAt: now,
    project: {
      id: 'project_1',
      clientId: 'client_1',
      createdById: null,
      name: 'Cocina integral',
      description: null,
      location: null,
      status: 'DESIGN',
      startDate: now,
      deliveryDate: null,
      closedAt: null,
      archivedAt: null,
      roomSpaceJson: JSON.stringify({
        layoutType: 'RECTANGULAR',
        widthMm: 3400,
        depthMm: 2800,
        heightMm: 2400,
        openings: [],
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }),
      createdAt: now,
      updatedAt: now,
      client: {
        id: 'client_1', personId: 'person_1', projectAddress: null, initialContactDate: null,
        status: 'ACTIVE', notes: null, consentAcceptedAt: null, createdAt: now, updatedAt: now,
        person: { id: 'person_1', firstName: 'Ana', lastName: 'Cliente', phone: null, address: null, email: null, rfc: null, createdAt: now, updatedAt: now }
      }
    },
    design: {
      id: 'design_1', projectId: 'project_1', createdById: null, approvedById: null,
      title: 'Diseño', version: 1, status: 'APPROVED', isCurrent: true,
      roomSpaceJson: null, designJson: '{}', notes: null, approvedAt: null, createdAt: now, updatedAt: now,
      modules: [{
        id: 'module_1', designId: 'design_1', templateId: null, materialId: null, name: 'Gabinete bajo',
        kind: 'BASE_CABINET', positionXmm: 500, positionYmm: 0, positionZmm: 500,
        rotationX: 0, rotationY: 0, rotationZ: 0, widthMm: 800, heightMm: 720, depthMm: 560,
        quantity: 1, notes: null, colorHex: '#FFFFFF', hasCollision, createdAt: now, updatedAt: now,
        material: null, template: null
      }]
    },
    createdBy: null
  } as RenderDetailRecord;
}

describe('render service rules', () => {
  afterEach(() => vi.restoreAllMocks());

  it('increments render versions per project', () => {
    expect(getNextRenderVersion(null)).toBe(1);
    expect(getNextRenderVersion(4)).toBe(5);
  });

  it('builds the FreeCAD DTO from the stored design', () => {
    const dto = buildFreeCadInput(createRenderRecord());
    expect(dto.project.units).toBe('mm');
    expect(dto.modules[0]?.type).toBe('BASE_CABINET');
    expect(dto.modules[0]?.material.thicknessMm).toBe(18);
  });

  it('blocks CAD generation when the design has collisions', () => {
    expect(() => buildFreeCadInput(createRenderRecord(true))).toThrow('módulos superpuestos');
  });
  it('marks a failed render and writes the failure to history', async () => {
    const record = createRenderRecord();
    vi.spyOn(RenderRepository.prototype, 'findById').mockResolvedValue(record);
    vi.spyOn(RenderRepository.prototype, 'findLatestVersion').mockResolvedValue({ version: 1 });
    const updateStatus = vi.spyOn(RenderRepository.prototype, 'updateStatus').mockResolvedValue({
      ...record,
      status: 'FAILED',
      failureMessage: 'falló la captura'
    });
    const historyCreate = vi.spyOn(HistoryRepository.prototype, 'create').mockResolvedValue({
      id: 'history_1', projectId: record.projectId, userId: null, action: 'STATUS_CHANGED',
      entityType: 'Render', entityId: record.id, title: 'Generación de render fallida',
      description: 'falló la captura', beforeJson: null, afterJson: null, createdAt: new Date()
    });
    const service = new RenderService({
      userDataPath: '/tmp/simbo',
      freeCadService: new FreeCadService({ scriptPath: '/tmp/missing.py', candidatePaths: [] })
    });

    await service.markRenderFailed(record.id, 'falló la captura');

    expect(updateStatus).toHaveBeenCalledWith(record.id, 'FAILED', 'falló la captura');
    expect(historyCreate).toHaveBeenCalledWith(expect.objectContaining({
      action: 'STATUS_CHANGED',
      entityType: 'Render',
      entityId: record.id
    }));
  });

});
