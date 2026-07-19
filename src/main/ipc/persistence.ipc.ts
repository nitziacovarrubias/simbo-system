import { app, ipcMain } from 'electron';
import { z } from 'zod';
import { IPC_CHANNELS } from './ipc-channels';
import { DatabaseService } from '../services/database.service';
import { DashboardService } from '../services/dashboard.service';
import { UserService } from '../services/user.service';
import { ClientService } from '../services/client.service';
import { ProjectService } from '../services/project.service';
import { DesignService } from '../services/design.service';
import { MaterialService } from '../services/material.service';
import { RenderService } from '../services/render.service';
import { CuttingListService } from '../services/cutting-list.service';
import { QuoteService } from '../services/quote.service';
import { ScheduleService } from '../services/schedule.service';
import { AlertService } from '../services/alert.service';
import { DocumentService } from '../services/document.service';
import { HistoryService } from '../services/history.service';
import { projectIdInputSchema } from '../../shared/schemas';

const idOnlySchema = z.string().min(1);

function registerSafeHandler<TArgs extends unknown[], TResult>(
  channel: string,
  handler: (...args: TArgs) => Promise<TResult> | TResult,
): void {
  ipcMain.handle(channel, async (_event, ...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido';
      console.error(`IPC handler failed: ${channel}`, error);
      throw new Error(`No se pudo completar la operación: ${message}`);
    }
  });
}

export function registerPersistenceIpcHandlers(): void {
  const databaseService = new DatabaseService();
  const dashboardService = new DashboardService();
  const userService = new UserService();
  const clientService = new ClientService();
  const projectService = new ProjectService();
  const designService = new DesignService();
  const materialService = new MaterialService();
  const renderService = new RenderService();
  const cuttingListService = new CuttingListService();
  const quoteService = new QuoteService();
  const scheduleService = new ScheduleService();
  const alertService = new AlertService();
  const documentService = new DocumentService();
  const historyService = new HistoryService();

  registerSafeHandler(IPC_CHANNELS.getAppInfo, () => ({
    name: app.getName(),
    version: app.getVersion(),
    environment: process.env.NODE_ENV ?? 'development',
  }));

  registerSafeHandler(IPC_CHANNELS.getDatabaseStatus, () => databaseService.getStatus());
  registerSafeHandler(IPC_CHANNELS.getDashboardSummary, () => dashboardService.getSummary());
  registerSafeHandler(IPC_CHANNELS.listUsers, () => userService.listUsers());
  registerSafeHandler(IPC_CHANNELS.listClients, () => clientService.listClients());
  registerSafeHandler(IPC_CHANNELS.listProjects, () => projectService.listProjects());
  registerSafeHandler(IPC_CHANNELS.listMaterials, () => materialService.listMaterials());

  registerSafeHandler(IPC_CHANNELS.listDesignsByProject, (projectId: string) => {
    const input = projectIdInputSchema.parse({ projectId });
    return designService.listDesignsByProject(input.projectId);
  });

  registerSafeHandler(IPC_CHANNELS.listRendersByProject, (projectId: string) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return renderService.listRendersByProject(validProjectId);
  });

  registerSafeHandler(IPC_CHANNELS.listCuttingListsByProject, (projectId: string) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return cuttingListService.listCuttingListsByProject(validProjectId);
  });

  registerSafeHandler(IPC_CHANNELS.listQuotesByProject, (projectId: string) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return quoteService.listQuotesByProject(validProjectId);
  });

  registerSafeHandler(IPC_CHANNELS.listActivitiesByProject, (projectId: string) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return scheduleService.listActivitiesByProject(validProjectId);
  });

  registerSafeHandler(IPC_CHANNELS.listAlertsByProject, (projectId: string) => {
    const validProjectId = idOnlySchema.parse(projectId);
    return alertService.listAlertsByProject(validProjectId);
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
