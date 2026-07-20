import { contextBridge, ipcRenderer } from 'electron';
import type { SimboApi } from '../shared/types';
import { IPC_CHANNELS } from '../main/ipc/ipc-channels';

console.log('[SIMBO PRELOAD] Starting preload');

const simboApi: SimboApi = {
  getAppInfo: () => ipcRenderer.invoke(IPC_CHANNELS.getAppInfo),
  getDatabaseStatus: () => ipcRenderer.invoke(IPC_CHANNELS.getDatabaseStatus),
  getDashboardSummary: () => ipcRenderer.invoke(IPC_CHANNELS.getDashboardSummary),
  listUsers: () => ipcRenderer.invoke(IPC_CHANNELS.listUsers),
  listClients: () => ipcRenderer.invoke(IPC_CHANNELS.listClients),
  getClientById: (clientId) => ipcRenderer.invoke(IPC_CHANNELS.getClientById, clientId),
  createClient: (input) => ipcRenderer.invoke(IPC_CHANNELS.createClient, input),
  updateClient: (clientId, input) => ipcRenderer.invoke(IPC_CHANNELS.updateClient, clientId, input),
  listProjects: () => ipcRenderer.invoke(IPC_CHANNELS.listProjects),
  getProjectById: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.getProjectById, projectId),
  createProject: (input) => ipcRenderer.invoke(IPC_CHANNELS.createProject, input),
  updateProject: (projectId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateProject, projectId, input),
  saveProjectRoomSpace: (projectId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveProjectRoomSpace, projectId, input),
  listDesignsByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listDesignsByProject, projectId),
  listMaterials: () => ipcRenderer.invoke(IPC_CHANNELS.listMaterials),
  listRendersByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listRendersByProject, projectId),
  listCuttingListsByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listCuttingListsByProject, projectId),
  listQuotesByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listQuotesByProject, projectId),
  listActivitiesByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listActivitiesByProject, projectId),
  listAlertsByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listAlertsByProject, projectId),
  listDocumentsByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listDocumentsByProject, projectId),
  listHistoryByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listHistoryByProject, projectId)
};

console.log('[SIMBO PRELOAD] API methods:', Object.keys(simboApi));

contextBridge.exposeInMainWorld('simboApi', simboApi);

console.log('[SIMBO PRELOAD] simboApi exposed successfully');