import { IPC_CHANNELS } from './ipc-channels';
import { registerSafeHandler } from './register-safe-handler';
import { ActivityService } from '../services/activity.service';
import { ProjectClosingService } from '../services/project-closing.service';
import { ProjectProgressService } from '../services/project-progress.service';
import { ScheduleService } from '../services/schedule.service';
import {
  activitySchema,
  activityUpdateSchema,
  archiveProjectSchema,
  closeProjectSchema,
  scheduleActivityIdSchema,
  scheduleProjectIdSchema
} from '../../shared/schemas';

export function registerScheduleIpcHandlers(): void {
  const scheduleService = new ScheduleService();
  const activityService = new ActivityService();
  const progressService = new ProjectProgressService();
  const closingService = new ProjectClosingService();

  registerSafeHandler(IPC_CHANNELS.getScheduleByProjectId, (projectId: string) =>
    scheduleService.getScheduleByProjectId(scheduleProjectIdSchema.parse(projectId))
  );
  registerSafeHandler(IPC_CHANNELS.createActivity, (projectId: string, input: unknown) =>
    activityService.createActivity(
      scheduleProjectIdSchema.parse(projectId),
      activitySchema.parse(input)
    )
  );
  registerSafeHandler(IPC_CHANNELS.updateActivity, (activityId: string, input: unknown) =>
    activityService.updateActivity(
      scheduleActivityIdSchema.parse(activityId),
      activityUpdateSchema.parse(input)
    )
  );
  registerSafeHandler(IPC_CHANNELS.deleteActivity, (activityId: string) =>
    activityService.deleteActivity(scheduleActivityIdSchema.parse(activityId))
  );
  registerSafeHandler(IPC_CHANNELS.getProjectProgressReport, (projectId: string) =>
    progressService.getProjectProgressReport(scheduleProjectIdSchema.parse(projectId))
  );
  registerSafeHandler(IPC_CHANNELS.closeProject, (projectId: string, input: unknown) =>
    closingService.closeProject(
      scheduleProjectIdSchema.parse(projectId),
      closeProjectSchema.parse(input)
    )
  );
  registerSafeHandler(IPC_CHANNELS.archiveProject, (projectId: string, input: unknown) =>
    closingService.archiveProject(
      scheduleProjectIdSchema.parse(projectId),
      archiveProjectSchema.parse(input)
    )
  );
}
