import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '../database/prisma';
import { HistoryRepository } from '../repositories/history.repository';
import {
  RenderRepository,
  type RenderDetailRecord
} from '../repositories/render.repository';
import { freeCadInputSchema } from '../../shared/schemas/freecad.schema';
import {
  renderDecisionSchema,
  renderImageDataUrlSchema,
  renderRejectSchema,
  renderSettingsSchema
} from '../../shared/schemas/render.schema';
import { RENDER_RESOLUTION_PRESETS } from '../../shared/constants/render-options';
import type {
  CadArtifacts,
  FreeCadInput,
  FreeCadStatus,
  RenderCopyArtifactType,
  RenderDetail,
  RenderGenerationResult,
  RenderSettingsInput,
  RenderSummary
} from '../../shared/types/render.types';
import { parseRoomSpaceJson } from './room-space.service';
import { FreeCadService } from './freecad.service';
import { buildRenderStoragePaths, isPathInside } from '../utils/render-paths';

const DEFAULT_MATERIAL_THICKNESS_MM = 18;
const DEFAULT_MATERIAL_COLOR = '#C9C0AF';

export function getNextRenderVersion(latestVersion: number | null | undefined): number {
  return (latestVersion ?? 0) + 1;
}

function isSourceOutdated(render: {
  generatedAt: Date | null;
  design: { updatedAt: Date } | null;
}): boolean {
  return Boolean(
    render.generatedAt &&
      render.design?.updatedAt &&
      render.design.updatedAt.getTime() > render.generatedAt.getTime()
  );
}

function artifactFlags(render: {
  id: string;
  fcstdPath: string | null;
  stepPath: string | null;
  stlPath: string | null;
  objPath: string | null;
}): CadArtifacts {
  return {
    renderId: render.id,
    fcstdAvailable: Boolean(render.fcstdPath && existsSync(render.fcstdPath)),
    stepAvailable: Boolean(render.stepPath && existsSync(render.stepPath)),
    stlAvailable: Boolean(render.stlPath && existsSync(render.stlPath))
  };
}

function mapSummary(
  render: Awaited<ReturnType<RenderRepository['listByProject']>>[number],
  latestVersion: number
): RenderSummary {
  return {
    id: render.id,
    projectId: render.projectId,
    designId: render.designId,
    title: render.title,
    versionNumber: render.version,
    status: render.status as RenderSummary['status'],
    imageFormat: render.format as RenderSummary['imageFormat'],
    resolutionWidth: render.resolutionWidth,
    resolutionHeight: render.resolutionHeight,
    viewType: (render.viewType ?? 'ISOMETRIC') as RenderSummary['viewType'],
    quality: (render.quality ?? 'HIGH') as RenderSummary['quality'],
    generatedAt: render.generatedAt?.toISOString() ?? null,
    updatedAt: render.updatedAt.toISOString(),
    hasImage: Boolean(render.filePath && existsSync(render.filePath)),
    hasCadArtifacts: Boolean(
      (render.fcstdPath && existsSync(render.fcstdPath)) ||
        (render.stepPath && existsSync(render.stepPath)) ||
        (render.stlPath && existsSync(render.stlPath))
    ),
    isLatestVersion: render.version === latestVersion,
    isSourceOutdated: isSourceOutdated(render)
  };
}

function mapDetail(render: RenderDetailRecord, latestVersion: number): RenderDetail {
  const room = parseRoomSpaceJson(render.design?.roomSpaceJson ?? render.project.roomSpaceJson);
  const materials = [
    ...new Set(
      (render.design?.modules ?? []).map((module) => module.material?.name).filter((name): name is string => Boolean(name))
    )
  ];
  const createdByName = render.createdBy?.person
    ? `${render.createdBy.person.firstName} ${render.createdBy.person.lastName}`.trim()
    : render.createdBy?.username ?? null;

  return {
    id: render.id,
    projectId: render.projectId,
    designId: render.designId,
    title: render.title,
    versionNumber: render.version,
    status: render.status as RenderDetail['status'],
    imageFormat: render.format as RenderDetail['imageFormat'],
    resolutionWidth: render.resolutionWidth,
    resolutionHeight: render.resolutionHeight,
    viewType: (render.viewType ?? 'ISOMETRIC') as RenderDetail['viewType'],
    quality: (render.quality ?? 'HIGH') as RenderDetail['quality'],
    generatedAt: render.generatedAt?.toISOString() ?? null,
    updatedAt: render.updatedAt.toISOString(),
    hasImage: Boolean(render.filePath && existsSync(render.filePath)),
    hasCadArtifacts: Boolean(
      (render.fcstdPath && existsSync(render.fcstdPath)) ||
        (render.stepPath && existsSync(render.stepPath)) ||
        (render.stlPath && existsSync(render.stlPath))
    ),
    isLatestVersion: render.version === latestVersion,
    isSourceOutdated: isSourceOutdated(render),
    projectName: render.project.name,
    designVersion: render.design?.version ?? null,
    designUpdatedAt: render.design?.updatedAt.toISOString() ?? null,
    notes: render.notes ?? '',
    sizeMb: render.sizeMb,
    failureMessage: render.failureMessage,
    createdByName,
    createdAt: render.createdAt.toISOString(),
    roomWidthMm: room?.widthMm ?? null,
    roomDepthMm: room?.depthMm ?? null,
    roomHeightMm: room?.heightMm ?? null,
    mainMaterials: materials,
    cadArtifacts: artifactFlags(render)
  };
}

export function buildFreeCadInput(render: RenderDetailRecord): FreeCadInput {
  if (!render.design) {
    throw new Error('El render no tiene un diseño asociado para generar CAD.');
  }
  const room = parseRoomSpaceJson(render.design.roomSpaceJson ?? render.project.roomSpaceJson);
  if (!room) {
    throw new Error('El proyecto no tiene medidas válidas para generar CAD.');
  }
  if (render.design.modules.length === 0) {
    throw new Error('El diseño necesita al menos un módulo para generar CAD.');
  }
  if (render.design.modules.some((module) => module.hasCollision)) {
    throw new Error('No se puede generar el modelo CAD porque existen módulos superpuestos.');
  }

  return freeCadInputSchema.parse({
    project: {
      id: render.projectId,
      name: render.project.name,
      units: 'mm'
    },
    room: {
      layoutType: room.layoutType,
      widthMm: room.widthMm,
      depthMm: room.depthMm,
      heightMm: room.heightMm
    },
    modules: render.design.modules.map((module) => ({
      id: module.id,
      type: module.kind,
      name: module.name,
      widthMm: module.widthMm,
      heightMm: module.heightMm,
      depthMm: module.depthMm,
      positionX: module.positionXmm,
      positionY: module.positionYmm,
      positionZ: module.positionZmm,
      rotationY: module.rotationY,
      material: {
        name: module.material?.name ?? 'Material sin especificar',
        thicknessMm: module.material?.thicknessMm ?? DEFAULT_MATERIAL_THICKNESS_MM,
        colorHex: module.material?.colorHex ?? module.colorHex ?? DEFAULT_MATERIAL_COLOR
      }
    }))
  });
}

function decodeRenderImage(dataUrl: string, expectedFormat: string): Buffer {
  const validDataUrl = renderImageDataUrlSchema.parse(dataUrl);
  const match = /^data:image\/(png|jpeg);base64,(.+)$/s.exec(validDataUrl);
  if (!match) throw new Error('No se pudo interpretar la imagen del render.');
  const mimeFormat = match[1] === 'png' ? 'PNG' : 'JPEG';
  if (mimeFormat !== expectedFormat) {
    throw new Error('El formato de la imagen capturada no coincide con la configuración del render.');
  }
  return Buffer.from(match[2] ?? '', 'base64');
}

export interface RenderServiceOptions {
  userDataPath: string;
  freeCadService: FreeCadService;
}

export class RenderService {
  private readonly renders = new RenderRepository(prisma);
  private readonly history = new HistoryRepository(prisma);

  constructor(private readonly options: RenderServiceOptions) {}

  async getFreeCadStatus(): Promise<FreeCadStatus> {
    return this.options.freeCadService.getStatus();
  }

  async listRendersByProject(projectId: string): Promise<RenderSummary[]> {
    const renders = await this.renders.listByProject(projectId);
    const latestVersion = renders[0]?.version ?? 0;
    return renders.map((render) => mapSummary(render, latestVersion));
  }

  async getRenderById(renderId: string): Promise<RenderDetail> {
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    const latest = await this.renders.findLatestVersion(render.projectId);
    return mapDetail(render, latest?.version ?? render.version);
  }

  async prepareRender(
    projectId: string,
    designId: string,
    input: RenderSettingsInput
  ): Promise<RenderDetail> {
    const settings = renderSettingsSchema.parse(input);
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error('No se encontró el proyecto.');
    if (project.status === 'CLOSED' || project.status === 'ARCHIVED') {
      throw new Error('No se pueden generar renders para un proyecto cerrado o archivado.');
    }
    const design = await prisma.design.findUnique({
      where: { id: designId },
      include: { modules: true }
    });
    if (!design || design.projectId !== projectId) {
      throw new Error('No se encontró el diseño seleccionado para este proyecto.');
    }
    if (design.modules.length === 0) {
      throw new Error('Agrega al menos un módulo antes de generar el render.');
    }
    if (design.modules.some((module) => module.hasCollision)) {
      throw new Error('No se puede generar el render porque existen módulos superpuestos.');
    }

    const latest = await this.renders.findLatestVersion(projectId);
    const resolution = RENDER_RESOLUTION_PRESETS[settings.resolution];
    let createdById: string | null = null;
    if (settings.createdByUserId) {
      const userExists = await prisma.user.count({ where: { id: settings.createdByUserId } });
      if (userExists > 0) createdById = settings.createdByUserId;
    }

    const render = await this.renders.create({
      project: { connect: { id: projectId } },
      design: { connect: { id: designId } },
      ...(createdById ? { createdBy: { connect: { id: createdById } } } : {}),
      title: settings.title,
      version: getNextRenderVersion(latest?.version),
      status: 'GENERATING',
      format: settings.imageFormat,
      resolutionWidth: resolution.width,
      resolutionHeight: resolution.height,
      viewType: settings.viewType,
      quality: settings.quality,
      notes: settings.notes || null
    });

    await this.history.create({
      project: { connect: { id: projectId } },
      action: 'CREATED',
      entityType: 'Render',
      entityId: render.id,
      title: 'Generación de render iniciada',
      description: `Se inició la versión ${render.version} del render ${render.title}.`
    });

    const latestVersion = render.version;
    return mapDetail(render, latestVersion);
  }

  async completeRender(renderId: string, dataUrl: string): Promise<RenderGenerationResult> {
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    if (!['GENERATING', 'FAILED'].includes(render.status)) {
      throw new Error('Este render ya fue generado y no puede sobrescribirse.');
    }
    const warnings: string[] = [];

    try {
      const image = decodeRenderImage(dataUrl, render.format);
      const paths = buildRenderStoragePaths(this.options.userDataPath, render.projectId, render.id);
      await mkdir(paths.rendersDirectory, { recursive: true });
      const extension = render.format === 'PNG' ? 'png' : 'jpg';
      const imagePath = path.join(paths.rendersDirectory, `${render.id}-v${render.version}.${extension}`);
      await writeFile(imagePath, image);
      const sizeMb = Math.round((image.byteLength / 1024 / 1024) * 100) / 100;
      const generatedAt = new Date();
      await this.renders.update(render.id, {
        filePath: imagePath,
        thumbnailPath: imagePath,
        sizeMb,
        status: 'PRELIMINARY',
        generatedAt,
        failureMessage: null
      });
      await this.history.create({
        project: { connect: { id: render.projectId } },
        action: 'CREATED',
        entityType: 'Render',
        entityId: render.id,
        title: 'Render creado',
        description: `Se guardó la versión ${render.version} en ${render.format} (${render.resolutionWidth} × ${render.resolutionHeight}).`
      });

      const freeCadStatus = await this.getFreeCadStatus();
      if (freeCadStatus.available) {
        try {
          const cadWarnings = await this.generateCadForRender(render.id);
          warnings.push(...cadWarnings);
        } catch (error) {
          warnings.push(error instanceof Error ? error.message : 'No se pudo generar el modelo CAD.');
        }
      } else {
        warnings.push(freeCadStatus.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo guardar el render.';
      await this.markRenderFailed(render.id, message);
      throw error;
    }

    return { render: await this.getRenderById(render.id), warnings };
  }

  async markRenderFailed(renderId: string, message: string): Promise<RenderDetail> {
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    await this.renders.updateStatus(renderId, 'FAILED', message.slice(0, 2000));
    await this.history.create({
      project: { connect: { id: render.projectId } },
      action: 'STATUS_CHANGED',
      entityType: 'Render',
      entityId: render.id,
      title: 'Generación de render fallida',
      description: message.slice(0, 1000)
    });
    return this.getRenderById(renderId);
  }

  async generateCadForRender(renderId: string): Promise<string[]> {
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    if (render.project.status === 'CLOSED' || render.project.status === 'ARCHIVED') {
      throw new Error('No se puede generar CAD para un proyecto cerrado o archivado.');
    }
    const input = buildFreeCadInput(render);
    const status = await this.getFreeCadStatus();
    if (!status.available) throw new Error(status.message);

    const paths = buildRenderStoragePaths(this.options.userDataPath, render.projectId, render.id);
    await mkdir(paths.renderTempDirectory, { recursive: true });
    await mkdir(paths.renderCadDirectory, { recursive: true });
    await this.history.create({
      project: { connect: { id: render.projectId } },
      action: 'CREATED',
      entityType: 'Render',
      entityId: render.id,
      title: 'Generación CAD iniciada',
      description: `Se envió la versión ${render.version} a FreeCADCmd.`
    });

    try {
      const output = await this.options.freeCadService.generateModel(
        input,
        paths.renderTempDirectory,
        paths.renderCadDirectory
      );
      await this.renders.update(render.id, {
        fcstdPath: output.files.fcstd,
        stepPath: output.files.step,
        stlPath: output.files.stl,
        objPath: output.files.obj,
        failureMessage: null
      });
      await this.history.create({
        project: { connect: { id: render.projectId } },
        action: 'UPDATED',
        entityType: 'Render',
        entityId: render.id,
        title: 'Generación CAD completada',
        description: 'FreeCAD generó FCStd, STEP y STL correctamente.'
      });
      await rm(paths.renderTempDirectory, { recursive: true, force: true });
      return output.warnings;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'FreeCADCmd no pudo completar la generación.';
      await this.renders.update(render.id, { failureMessage: message.slice(0, 2000) });
      await this.history.create({
        project: { connect: { id: render.projectId } },
        action: 'STATUS_CHANGED',
        entityType: 'Render',
        entityId: render.id,
        title: 'Generación CAD fallida',
        description: message.slice(0, 1000)
      });
      throw new Error(`No se pudo generar el modelo CAD: ${message}`);
    }
  }

  async getCadArtifacts(renderId: string): Promise<CadArtifacts> {
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    return artifactFlags(render);
  }

  async getRenderImageData(renderId: string): Promise<string | null> {
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    if (!render.filePath) return null;
    if (!isPathInside(this.options.userDataPath, render.filePath) || !existsSync(render.filePath)) {
      throw new Error('La imagen del render no está disponible en la carpeta controlada por SIMBO.');
    }
    const buffer = await readFile(render.filePath);
    const mime = render.format === 'PNG' ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${buffer.toString('base64')}`;
  }

  async approveRender(renderId: string, notes?: string): Promise<RenderDetail> {
    const input = renderDecisionSchema.parse({ notes });
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    if (render.status === 'GENERATING' || render.status === 'FAILED') {
      throw new Error('Solo se puede aprobar un render generado correctamente.');
    }
    await this.renders.update(renderId, {
      status: 'APPROVED',
      notes: input.notes ? `${render.notes ?? ''}\nAprobación: ${input.notes}`.trim() : render.notes
    });
    await this.history.create({
      project: { connect: { id: render.projectId } },
      action: 'APPROVED',
      entityType: 'Render',
      entityId: render.id,
      title: 'Render aprobado',
      description: input.notes || `Se aprobó la versión ${render.version}.`
    });
    return this.getRenderById(renderId);
  }

  async rejectRender(renderId: string, reason: string): Promise<RenderDetail> {
    const input = renderRejectSchema.parse({ reason });
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    if (render.status === 'GENERATING') throw new Error('Espera a que termine la generación antes de rechazar.');
    await this.renders.update(renderId, {
      status: 'REJECTED',
      notes: `${render.notes ?? ''}\nRechazo: ${input.reason}`.trim()
    });
    await this.history.create({
      project: { connect: { id: render.projectId } },
      action: 'REJECTED',
      entityType: 'Render',
      entityId: render.id,
      title: 'Render rechazado',
      description: input.reason
    });
    return this.getRenderById(renderId);
  }

  async recordArtifactCopy(renderId: string, artifactType: RenderCopyArtifactType): Promise<void> {
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    await this.history.create({
      project: { connect: { id: render.projectId } },
      action: 'EXPORTED',
      entityType: 'Render',
      entityId: render.id,
      title: 'Copia de archivo de render guardada',
      description: `Se guardó una copia del artefacto ${artifactType} de la versión ${render.version}.`
    });
  }

  async resolveArtifactPath(renderId: string, artifactType: RenderCopyArtifactType): Promise<string> {
    const render = await this.renders.findById(renderId);
    if (!render) throw new Error('No se encontró el render.');
    const artifactMap: Record<RenderCopyArtifactType, string | null> = {
      IMAGE: render.filePath,
      FCSTD: render.fcstdPath,
      STEP: render.stepPath,
      STL: render.stlPath
    };
    const artifactPath = artifactMap[artifactType];
    if (!artifactPath || !existsSync(artifactPath)) {
      throw new Error('El archivo solicitado todavía no está disponible.');
    }
    if (!isPathInside(this.options.userDataPath, artifactPath)) {
      throw new Error('El archivo solicitado está fuera de las rutas administradas por SIMBO.');
    }
    return artifactPath;
  }
}
