import { IPC_CHANNELS } from './ipc-channels';
import { registerSafeHandler } from './register-safe-handler';
import { AlertService } from '../services/alert.service';
import {
  alertResolutionSchema,
  incidentAlertSchema,
  scheduleAlertIdSchema,
  scheduleProjectIdSchema
} from '../../shared/schemas';

export function registerAlertIpcHandlers(): void {
  const alertService = new AlertService();

  registerSafeHandler(IPC_CHANNELS.generateProjectAlerts, (projectId: string) =>
    alertService.generateProjectAlerts(scheduleProjectIdSchema.parse(projectId))
  );
  registerSafeHandler(IPC_CHANNELS.getAlertsByProjectId, (projectId: string) =>
    alertService.getAlertsByProjectId(scheduleProjectIdSchema.parse(projectId))
  );
  registerSafeHandler(IPC_CHANNELS.getAllAlerts, () => alertService.getAllAlerts());
  registerSafeHandler(IPC_CHANNELS.createIncidentAlert, (projectId: string, input: unknown) =>
    alertService.createIncidentAlert(
      scheduleProjectIdSchema.parse(projectId),
      incidentAlertSchema.parse(input)
    )
  );
  registerSafeHandler(IPC_CHANNELS.resolveAlert, (alertId: string, notes: unknown) =>
    alertService.resolveAlert(
      scheduleAlertIdSchema.parse(alertId),
      alertResolutionSchema.parse({ notes }).notes
    )
  );
  registerSafeHandler(IPC_CHANNELS.dismissAlert, (alertId: string, notes: unknown) =>
    alertService.dismissAlert(
      scheduleAlertIdSchema.parse(alertId),
      alertResolutionSchema.parse({ notes }).notes
    )
  );
}
