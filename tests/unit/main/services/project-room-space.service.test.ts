import { describe, expect, it, vi } from 'vitest';

vi.mock('@prisma/client', () => ({
  ProjectStatus: {
    DRAFT: 'DRAFT',
    DESIGN: 'DESIGN',
    CLOSED: 'CLOSED',
    ARCHIVED: 'ARCHIVED'
  }
}));

vi.mock('../../../../src/main/database/prisma', () => ({
  prisma: {}
}));
import { ProjectService } from '../../../../src/main/services/project.service';
import type {
  ProjectClientRepositoryPort,
  ProjectHistoryRepositoryPort,
  ProjectRepositoryPort
} from '../../../../src/main/services/project.service';
import type { ProjectDetailRecord } from '../../../../src/main/repositories/project.repository';

function createProjectRecord(
  roomSpaceJson: string | null,
  status: 'DRAFT' | 'DESIGN'
): ProjectDetailRecord {
  const now = new Date('2026-07-19T12:00:00.000Z');
  return {
    id: 'project-1',
    clientId: 'client-1',
    createdById: null,
    name: 'Cocina de prueba',
    description: null,
    location: 'Hermosillo',
    status,
    startDate: now,
    deliveryDate: null,
    closedAt: null,
    archivedAt: null,
    roomSpaceJson,
    createdAt: now,
    updatedAt: now,
    client: {
      id: 'client-1',
      personId: 'person-1',
      projectAddress: 'Hermosillo',
      initialContactDate: now,
      status: 'ACTIVE',
      notes: null,
      consentAcceptedAt: null,
      createdAt: now,
      updatedAt: now,
      person: {
        id: 'person-1',
        firstName: 'Laura',
        lastName: 'Méndez',
        phone: null,
        address: null,
        email: null,
        rfc: null,
        createdAt: now,
        updatedAt: now
      }
    },
    activities: [],
    historyEntries: []
  };
}

describe('ProjectService.saveProjectRoomSpace', () => {
  it('stores valid room space and prepares a draft project for design', async () => {
    const current = createProjectRecord(null, 'DRAFT');
    const updated = createProjectRecord(
      JSON.stringify({
        layoutType: 'RECTANGULAR',
        widthMm: 3400,
        depthMm: 2800,
        heightMm: 2400,
        openings: [],
        createdAt: '2026-07-19T12:00:00.000Z',
        updatedAt: '2026-07-19T12:00:00.000Z'
      }),
      'DESIGN'
    );

    const projects = {
      list: vi.fn(),
      findById: vi.fn().mockResolvedValueOnce(current).mockResolvedValueOnce(updated),
      create: vi.fn(),
      update: vi.fn(),
      saveRoomSpace: vi.fn().mockResolvedValue(updated),
      updateStatus: vi.fn()
    } as unknown as ProjectRepositoryPort;
    const clients = { findById: vi.fn() } as unknown as ProjectClientRepositoryPort;
    const history = {
      create: vi.fn().mockResolvedValue({})
    } as unknown as ProjectHistoryRepositoryPort;
    const service = new ProjectService(projects, clients, history);

    const result = await service.saveProjectRoomSpace('project-1', {
      layoutType: 'RECTANGULAR',
      widthMm: 3400,
      depthMm: 2800,
      heightMm: 2400,
      wallThicknessMm: 120,
      notes: 'Espacio de prueba',
      openings: []
    });

    expect(projects.saveRoomSpace).toHaveBeenCalledWith(
      'project-1',
      expect.stringContaining('"layoutType":"RECTANGULAR"'),
      'DESIGN'
    );
    expect(history.create).toHaveBeenCalledOnce();
    expect(result.status).toBe('DESIGN');
    expect(result.roomSpace?.widthMm).toBe(3400);
  });

  it('rejects invalid room space data', async () => {
    const projects = {
      list: vi.fn(),
      findById: vi.fn().mockResolvedValue(createProjectRecord(null, 'DRAFT')),
      create: vi.fn(),
      update: vi.fn(),
      saveRoomSpace: vi.fn(),
      updateStatus: vi.fn()
    } as unknown as ProjectRepositoryPort;
    const clients = { findById: vi.fn() } as unknown as ProjectClientRepositoryPort;
    const history = { create: vi.fn() } as unknown as ProjectHistoryRepositoryPort;
    const service = new ProjectService(projects, clients, history);

    await expect(
      service.saveProjectRoomSpace('project-1', {
        layoutType: 'RECTANGULAR',
        widthMm: -1,
        depthMm: 2800,
        heightMm: 2400,
        openings: []
      })
    ).rejects.toThrow();

    expect(projects.saveRoomSpace).not.toHaveBeenCalled();
  });
});
