import { contextBridge, ipcRenderer } from 'electron';
import type { SimboApi } from '../shared/types';
import { IPC_CHANNELS } from '../main/ipc/ipc-channels';

const simboApi: SimboApi = {
  getAppInfo: () => ipcRenderer.invoke(IPC_CHANNELS.getAppInfo),
  getDatabaseStatus: () => ipcRenderer.invoke(IPC_CHANNELS.getDatabaseStatus),
  getDashboardSummary: () => ipcRenderer.invoke(IPC_CHANNELS.getDashboardSummary),
  listUsers: () => ipcRenderer.invoke(IPC_CHANNELS.listUsers),
  listClients: () => ipcRenderer.invoke(IPC_CHANNELS.listClients),
  listProjects: () => ipcRenderer.invoke(IPC_CHANNELS.listProjects),
  listDesignsByProject: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.listDesignsByProject, projectId),
  listMaterials: () => ipcRenderer.invoke(IPC_CHANNELS.listMaterials),
  listRendersByProject: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.listRendersByProject, projectId),
  listCuttingListsByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listCuttingListsByProject, projectId),
  listQuotesByProject: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.listQuotesByProject, projectId),
  listActivitiesByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listActivitiesByProject, projectId),
  listAlertsByProject: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.listAlertsByProject, projectId),
  listDocumentsByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listDocumentsByProject, projectId),
  listHistoryByProject: (projectId) => ipcRenderer.invoke(IPC_CHANNELS.listHistoryByProject, projectId),
};

contextBridge.exposeInMainWorld('simboApi', simboApi);
