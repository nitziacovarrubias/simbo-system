import { app, dialog, shell } from 'electron';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';
import { IPC_CHANNELS } from './ipc-channels';
import { registerSafeHandler } from './register-safe-handler';
import { renderImageDataUrlSchema, renderSettingsSchema } from '../../shared/schemas';
import { FreeCadService } from '../services/freecad.service';
import { RenderService } from '../services/render.service';
import type { RenderCopyArtifactType } from '../../shared/types/render.types';

const idSchema = z.string().min(1);
const artifactTypeSchema = z.enum(['IMAGE', 'FCSTD', 'STEP', 'STL']);

function getFreeCadScriptPath(): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'freecad', 'generate_model.py')
    : path.join(process.cwd(), 'freecad', 'generate_model.py');
}

let renderService: RenderService | null = null;

function getRenderService(): RenderService {
  if (renderService) return renderService;
  renderService = new RenderService({
    userDataPath: app.getPath('userData'),
    freeCadService: new FreeCadService({
      scriptPath: getFreeCadScriptPath(),
      timeoutMs: Number(process.env.FREECAD_TIMEOUT_MS ?? 120_000)
    })
  });
  return renderService;
}

export function registerRenderIpcHandlers(): void {

  registerSafeHandler(IPC_CHANNELS.getFreeCadStatus, () => getRenderService().getFreeCadStatus());
  registerSafeHandler(IPC_CHANNELS.listRendersByProject, (projectId: string) =>
    getRenderService().listRendersByProject(idSchema.parse(projectId))
  );
  registerSafeHandler(IPC_CHANNELS.getRenderById, (renderId: string) =>
    getRenderService().getRenderById(idSchema.parse(renderId))
  );
  registerSafeHandler(
    IPC_CHANNELS.prepareProjectRender,
    (projectId: string, designId: string, input: unknown) =>
      getRenderService().prepareRender(
        idSchema.parse(projectId),
        idSchema.parse(designId),
        renderSettingsSchema.parse(input)
      )
  );
  registerSafeHandler(
    IPC_CHANNELS.completeProjectRender,
    (renderId: string, imageDataUrl: unknown) =>
      getRenderService().completeRender(idSchema.parse(renderId), renderImageDataUrlSchema.parse(imageDataUrl))
  );
  registerSafeHandler(IPC_CHANNELS.failProjectRender, (renderId: string, message: string) =>
    getRenderService().markRenderFailed(idSchema.parse(renderId), z.string().min(1).max(2000).parse(message))
  );
  registerSafeHandler(IPC_CHANNELS.generateRenderCad, (renderId: string) =>
    getRenderService().generateCadForRender(idSchema.parse(renderId))
  );
  registerSafeHandler(IPC_CHANNELS.getCadArtifacts, (renderId: string) =>
    getRenderService().getCadArtifacts(idSchema.parse(renderId))
  );
  registerSafeHandler(IPC_CHANNELS.getRenderImageData, (renderId: string) =>
    getRenderService().getRenderImageData(idSchema.parse(renderId))
  );
  registerSafeHandler(IPC_CHANNELS.approveRender, (renderId: string, notes?: string) =>
    getRenderService().approveRender(idSchema.parse(renderId), notes)
  );
  registerSafeHandler(IPC_CHANNELS.rejectRender, (renderId: string, reason: string) =>
    getRenderService().rejectRender(idSchema.parse(renderId), z.string().min(1).parse(reason))
  );
  registerSafeHandler(
    IPC_CHANNELS.saveRenderCopy,
    async (renderId: string, artifactType: RenderCopyArtifactType) => {
      const validRenderId = idSchema.parse(renderId);
      const validArtifactType = artifactTypeSchema.parse(artifactType);
      const sourcePath = await getRenderService().resolveArtifactPath(validRenderId, validArtifactType);
      const result = await dialog.showSaveDialog({
        title: 'Guardar copia',
        defaultPath: path.basename(sourcePath)
      });
      if (result.canceled || !result.filePath) return { saved: false, fileName: null };
      await copyFile(sourcePath, result.filePath);
      await getRenderService().recordArtifactCopy(validRenderId, validArtifactType);
      return { saved: true, fileName: path.basename(result.filePath) };
    }
  );
  registerSafeHandler(IPC_CHANNELS.openRenderLocation, async (renderId: string) => {
    const validRenderId = idSchema.parse(renderId);
    let targetPath: string;
    try {
      targetPath = await getRenderService().resolveArtifactPath(validRenderId, 'IMAGE');
    } catch {
      targetPath = await getRenderService().resolveArtifactPath(validRenderId, 'FCSTD');
    }
    shell.showItemInFolder(targetPath);
    return true;
  });
}
