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
  getDesignByProjectId: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.getDesignByProjectId, projectId),
  createDesign: (projectId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.createDesign, projectId, input),
  updateDesign: (designId, input) => ipcRenderer.invoke(IPC_CHANNELS.updateDesign, designId, input),
  saveDesignModules: (designId, modules) =>
    ipcRenderer.invoke(IPC_CHANNELS.saveDesignModules, designId, modules),
  getModuleTemplates: () => ipcRenderer.invoke(IPC_CHANNELS.getModuleTemplates),
  getMaterials: () => ipcRenderer.invoke(IPC_CHANNELS.getMaterials),
  listMaterials: () => ipcRenderer.invoke(IPC_CHANNELS.listMaterials),
  listRendersByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listRendersByProject, projectId),
  getCuttingListsByProjectId: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.getCuttingListsByProjectId, projectId),
  getCuttingListById: (cuttingListId) =>
    ipcRenderer.invoke(IPC_CHANNELS.getCuttingListById, cuttingListId),
  generateCuttingList: (projectId, designId) =>
    ipcRenderer.invoke(IPC_CHANNELS.generateCuttingList, projectId, designId),
  updateCuttingPiece: (pieceId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateCuttingPiece, pieceId, input),
  addManualCuttingPiece: (cuttingListId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.addManualCuttingPiece, cuttingListId, input),
  removeCuttingPiece: (pieceId) =>
    ipcRenderer.invoke(IPC_CHANNELS.removeCuttingPiece, pieceId),
  authorizeCuttingList: (cuttingListId, notes) =>
    ipcRenderer.invoke(IPC_CHANNELS.authorizeCuttingList, cuttingListId, notes),
  rejectCuttingList: (cuttingListId, reason) =>
    ipcRenderer.invoke(IPC_CHANNELS.rejectCuttingList, cuttingListId, reason),
  exportCuttingListToExcel: (cuttingListId) =>
    ipcRenderer.invoke(IPC_CHANNELS.exportCuttingListToExcel, cuttingListId),
  getQuotesByProjectId: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.getQuotesByProjectId, projectId),
  getQuoteById: (quoteId) => ipcRenderer.invoke(IPC_CHANNELS.getQuoteById, quoteId),
  generateQuote: (projectId, cuttingListId) =>
    ipcRenderer.invoke(IPC_CHANNELS.generateQuote, projectId, cuttingListId),
  updateQuoteItem: (quoteItemId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateQuoteItem, quoteItemId, input),
  addQuoteItem: (quoteId, input) => ipcRenderer.invoke(IPC_CHANNELS.addQuoteItem, quoteId, input),
  removeQuoteItem: (quoteItemId) => ipcRenderer.invoke(IPC_CHANNELS.removeQuoteItem, quoteItemId),
  updateQuoteAdjustments: (quoteId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateQuoteAdjustments, quoteId, input),
  approveQuote: (quoteId, notes) => ipcRenderer.invoke(IPC_CHANNELS.approveQuote, quoteId, notes),
  rejectQuote: (quoteId, reason) => ipcRenderer.invoke(IPC_CHANNELS.rejectQuote, quoteId, reason),
  exportQuoteToExcel: (quoteId) => ipcRenderer.invoke(IPC_CHANNELS.exportQuoteToExcel, quoteId),
  getScheduleByProjectId: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.getScheduleByProjectId, projectId),
  createActivity: (projectId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.createActivity, projectId, input),
  updateActivity: (activityId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.updateActivity, activityId, input),
  deleteActivity: (activityId) => ipcRenderer.invoke(IPC_CHANNELS.deleteActivity, activityId),
  generateProjectAlerts: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.generateProjectAlerts, projectId),
  getAlertsByProjectId: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.getAlertsByProjectId, projectId),
  getAllAlerts: () => ipcRenderer.invoke(IPC_CHANNELS.getAllAlerts),
  createIncidentAlert: (projectId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.createIncidentAlert, projectId, input),
  resolveAlert: (alertId, notes) =>
    ipcRenderer.invoke(IPC_CHANNELS.resolveAlert, alertId, notes),
  dismissAlert: (alertId, notes) =>
    ipcRenderer.invoke(IPC_CHANNELS.dismissAlert, alertId, notes),
  getProjectProgressReport: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.getProjectProgressReport, projectId),
  closeProject: (projectId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.closeProject, projectId, input),
  archiveProject: (projectId, input) =>
    ipcRenderer.invoke(IPC_CHANNELS.archiveProject, projectId, input),
  listDocumentsByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listDocumentsByProject, projectId),
  listHistoryByProject: (projectId) =>
    ipcRenderer.invoke(IPC_CHANNELS.listHistoryByProject, projectId)
};

console.log('[SIMBO PRELOAD] API methods:', Object.keys(simboApi));

contextBridge.exposeInMainWorld('simboApi', simboApi);

console.log('[SIMBO PRELOAD] simboApi exposed successfully');
