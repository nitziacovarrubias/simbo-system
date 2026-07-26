import { prisma } from '../database/prisma';
import { DesignRepository, type DesignDetailRecord } from '../repositories/design.repository';
import { toDesignListItem } from './mappers';
import { parseRoomSpaceJson } from './room-space.service';
import type {
  CreateDesignInput,
  DesignDocument,
  DesignListItem,
  DesignModuleItem,
  DesignModuleMutationInput,
  DesignViewMode,
  ModuleTemplateItem,
  UpdateDesignInput
} from '../../shared/types';

interface DesignMetadata {
  viewMode?: DesignViewMode;
}

function parseMetadata(value: string): DesignMetadata {
  try {
    return JSON.parse(value) as DesignMetadata;
  } catch {
    return {};
  }
}

function mapModule(module: DesignDetailRecord['modules'][number]): DesignModuleItem {
  return {
    id: module.id,
    templateId: module.templateId ?? '',
    type: module.kind as DesignModuleItem['type'],
    displayName: module.name,
    positionX: module.positionXmm,
    positionY: module.positionYmm,
    positionZ: module.positionZmm,
    widthMm: module.widthMm,
    heightMm: module.heightMm,
    depthMm: module.depthMm,
    rotationY: module.rotationY,
    materialId: module.materialId,
    colorHex: module.colorHex,
    notes: module.notes ?? '',
    hasCollision: module.hasCollision,
    createdAt: module.createdAt.toISOString(),
    updatedAt: module.updatedAt.toISOString()
  };
}

function mapDesign(design: DesignDetailRecord): DesignDocument {
  const roomSpace = parseRoomSpaceJson(design.roomSpaceJson ?? design.project.roomSpaceJson);
  if (!roomSpace) {
    throw new Error('El proyecto no tiene medidas válidas para abrir el editor.');
  }
  return {
    id: design.id,
    projectId: design.projectId,
    title: design.title,
    version: design.version,
    status: design.status as DesignDocument['status'],
    isCurrent: design.isCurrent,
    roomSpace,
    viewMode: parseMetadata(design.designJson).viewMode ?? '3D',
    notes: design.notes ?? '',
    modules: design.modules.map(mapModule),
    createdAt: design.createdAt.toISOString(),
    updatedAt: design.updatedAt.toISOString()
  };
}

export class DesignService {
  private readonly designs = new DesignRepository(prisma);

  async listDesignsByProject(projectId: string): Promise<DesignListItem[]> {
    return (await this.designs.listByProject(projectId)).map(toDesignListItem);
  }

  async getDesignByProjectId(projectId: string): Promise<DesignDocument | null> {
    const design = await this.designs.findCurrentByProject(projectId);
    return design ? mapDesign(design) : null;
  }

  async createDesign(projectId: string, input: CreateDesignInput): Promise<DesignDocument> {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('No se encontró el proyecto.');
    if (!parseRoomSpaceJson(project.roomSpaceJson)) {
      throw new Error('Primero captura las medidas del espacio antes de iniciar el diseño.');
    }
    const latest = await this.designs.findLatestVersion(projectId);
    await this.designs.markPreviousDesignsAsNotCurrent(projectId);
    await prisma.cuttingList.updateMany({
      where: { projectId, status: { not: 'OUTDATED' } },
      data: { status: 'OUTDATED' }
    });
    await prisma.quote.updateMany({
      where: { projectId, status: { not: 'OUTDATED' } },
      data: { status: 'OUTDATED' }
    });
    const design = await this.designs.create({
      project: { connect: { id: projectId } },
      title: input.title,
      version: (latest?.version ?? 0) + 1,
      status: 'DRAFT',
      isCurrent: true,
      roomSpaceJson: JSON.stringify(input.roomSpace),
      designJson: JSON.stringify({ viewMode: input.viewMode }),
      notes: input.notes ?? null
    });
    return mapDesign(design);
  }

  async updateDesign(designId: string, input: UpdateDesignInput): Promise<DesignDocument> {
    const current = await this.designs.findById(designId);
    if (!current) throw new Error('No se encontró el diseño.');
    const metadata = parseMetadata(current.designJson);
    const design = await this.designs.update(designId, {
      title: input.title,
      notes: input.notes,
      status: input.status,
      designJson: JSON.stringify({
        ...metadata,
        viewMode: input.viewMode ?? metadata.viewMode ?? '3D'
      })
    });
    await prisma.quote.updateMany({
      where: { projectId: current.projectId, status: { not: 'OUTDATED' } },
      data: { status: 'OUTDATED' }
    });
    return mapDesign(design);
  }

  async saveDesignModules(
    designId: string,
    modules: DesignModuleMutationInput[]
  ): Promise<DesignDocument> {
    const design = await this.designs.findById(designId);
    if (!design) throw new Error('No se encontró el diseño.');

    await prisma.$transaction(async (tx) => {
      await tx.designModule.deleteMany({ where: { designId } });
      if (modules.length > 0) {
        await tx.designModule.createMany({
          data: modules.map((module) => ({
            id: module.id,
            designId,
            templateId: module.templateId,
            materialId: module.materialId,
            name: module.displayName,
            kind: module.type,
            positionXmm: module.positionX,
            positionYmm: module.positionY,
            positionZmm: module.positionZ,
            rotationY: module.rotationY,
            widthMm: module.widthMm,
            heightMm: module.heightMm,
            depthMm: module.depthMm,
            notes: module.notes || null,
            colorHex: module.colorHex,
            hasCollision: module.hasCollision
          }))
        });
      }
      await tx.design.update({ where: { id: designId }, data: { updatedAt: new Date() } });
      await tx.cuttingList.updateMany({
        where: { designId, status: { not: 'OUTDATED' } },
        data: { status: 'OUTDATED' }
      });
      await tx.quote.updateMany({
        where: { projectId: design.projectId, status: { not: 'OUTDATED' } },
        data: { status: 'OUTDATED' }
      });
    });

    const saved = await this.designs.findById(designId);
    if (!saved) throw new Error('No se pudo recargar el diseño guardado.');
    return mapDesign(saved);
  }

  async getModuleTemplates(): Promise<ModuleTemplateItem[]> {
    const templates = await prisma.moduleTemplate.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }]
    });
    return templates.map((template) => ({
      id: template.id,
      code: template.code,
      type: template.code.split('-').slice(0, -1).join('_') as ModuleTemplateItem['type'],
      displayName: template.name,
      category: template.category,
      defaultWidthMm: template.defaultWidthMm,
      defaultHeightMm: template.defaultHeightMm,
      defaultDepthMm: template.defaultDepthMm,
      isActive: template.isActive
    }));
  }
}
