import { app } from 'electron';
import { z } from 'zod';
import { registerSafeHandler } from './register-safe-handler';
import { IPC_CHANNELS } from './ipc-channels';
import { DatabaseService } from '../services/database.service';
import { DashboardService } from '../services/dashboard.service';
import { UserService } from '../services/user.service';
import { ClientService } from '../services/client.service';
import { ProjectService } from '../services/project.service';
import { DesignService } from '../services/design.service';
import { MaterialService } from '../services/material.service';
import { RenderService } from '../services/render.service';
import { DocumentService } from '../services/document.service';
import { HistoryService } from '../services/history.service';
import {
  clientSchema,
  createDesignSchema,
  designModulesSchema,
  projectIdInputSchema,
  projectSchema,
  roomSpaceSchema,
  updateDesignSchema
} from '../../shared/schemas';

const idOnlySchema = z.string().min(1);

export function registerPersistenceIpcHandlers(): void {
  const databaseService = new DatabaseService();
  const dashboardService = new DashboardService();
  const userService = new UserService();
  const clientService = new ClientService();
  const projectService = new ProjectService();
  const designService = new DesignService();
  const materialService = new MaterialService();
  const renderService = new RenderService();
  const documentService = new DocumentService();
  const historyService = new HistoryService();

  registerSafeHandler(IPC_CHANNELS.getAppInfo, () => ({
    name: app.getName(),
    version: app.getVersion(),
    environment: process.env.NODE_ENV ?? 'development'
  }));

  registerSafeHandler(IPC_CHANNELS.getDatabaseStatus, () => databaseService.getStatus());
  registerSafeHandler(IPC_CHANNELS.getDashboardSummary, () => dashboardService.getSummary());
  registerSafeHandler(IPC_CHANNELS.listUsers, () => userService.listUsers());
  registerSafeHandler(IPC_CHANNELS.listClients, () => clientService.listClients());
  registerSafeHandler(IPC_CHANNELS.getClientById, (clientId: string) =>
    clientService.getClientById(idOnlySchema.parse(clientId))
  );
  registerSafeHandler(IPC_CHANNELS.createClient, (input: unknown) =>
    clientService.createClient(clientSchema.parse(input))
  );
  registerSafeHandler(IPC_CHANNELS.updateClient, (clientId: string, input: unknown) =>
    clientService.updateClient(idOnlySchema.parse(clientId), clientSchema.parse(input))
  );

  registerSafeHandler(IPC_CHANNELS.listProjects, () => projectService.listProjects());
  registerSafeHandler(IPC_CHANNELS.getProjectById, (projectId: string) =>
    projectService.getProjectById(idOnlySchema.parse(projectId))
  );
  registerSafeHandler(IPC_CHANNELS.createProject, (input: unknown) =>
    projectService.createProject(projectSchema.parse(input))
  );
  registerSafeHandler(IPC_CHANNELS.updateProject, (projectId: string, input: unknown) =>
    projectService.updateProject(idOnlySchema.parse(projectId), projectSchema.parse(input))
  );
  registerSafeHandler(IPC_CHANNELS.saveProjectRoomSpace, (projectId: string, input: unknown) =>
    projectService.saveProjectRoomSpace(idOnlySchema.parse(projectId), roomSpaceSchema.parse(input))
  );
  registerSafeHandler(IPC_CHANNELS.listMaterials, () => materialService.listMaterials());

  registerSafeHandler(IPC_CHANNELS.listDesignsByProject, (projectId: string) => {
    const input = projectIdInputSchema.parse({ projectId });
    return designService.listDesignsByProject(input.projectId);
  });

  registerSafeHandler(IPC_CHANNELS.getDesignByProjectId, (projectId: string) => {
    const input = projectIdInputSchema.parse({ projectId });
    return designService.getDesignByProjectId(input.projectId);
  });

  registerSafeHandler(IPC_CHANNELS.createDesign, (projectId: string, input: unknown) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return designService.createDesign(validProjectId, createDesignSchema.parse(input));
  });

  registerSafeHandler(IPC_CHANNELS.updateDesign, (designId: string, input: unknown) =>
    designService.updateDesign(idOnlySchema.parse(designId), updateDesignSchema.parse(input))
  );

  registerSafeHandler(IPC_CHANNELS.saveDesignModules, (designId: string, modules: unknown) =>
    designService.saveDesignModules(
      idOnlySchema.parse(designId),
      designModulesSchema.parse(modules)
    )
  );

  registerSafeHandler(IPC_CHANNELS.getModuleTemplates, () => designService.getModuleTemplates());
  registerSafeHandler(IPC_CHANNELS.getMaterials, () => materialService.getMaterials());

  registerSafeHandler(IPC_CHANNELS.listRendersByProject, (projectId: string) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return renderService.listRendersByProject(validProjectId);
  });

  registerSafeHandler(IPC_CHANNELS.listDocumentsByProject, (projectId: string) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return documentService.listDocumentsByProject(validProjectId);
  });

  registerSafeHandler(IPC_CHANNELS.listHistoryByProject, (projectId: string) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return historyService.listHistoryByProject(validProjectId);
  });
}
