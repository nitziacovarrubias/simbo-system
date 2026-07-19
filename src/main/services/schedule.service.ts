import { prisma } from '../database/prisma';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { toActivityListItem } from './mappers';
import type { ActivityListItem } from '../../shared/types';

export class ScheduleService {
  private readonly schedule = new ScheduleRepository(prisma);

  async listActivitiesByProject(projectId: string): Promise<ActivityListItem[]> {
    const activities = await this.schedule.listActivitiesByProject(projectId);
    return activities.map(toActivityListItem);
  }
}
