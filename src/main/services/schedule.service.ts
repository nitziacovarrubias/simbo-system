import { prisma } from '../database/prisma';
import { ActivityRepository } from '../repositories/activity.repository';
import { ScheduleRepository } from '../repositories/schedule.repository';
import { UserRepository } from '../repositories/user.repository';
import { mapProjectActivity } from './activity.service';
import { ProjectProgressService } from './project-progress.service';
import type { ProjectSchedule } from '../../shared/types';
import type { ProjectStatus } from '../../shared/constants/domain.enums';
import type { UserRole } from '../../shared/constants/roles';

export class ScheduleService {
  constructor(
    private readonly schedule = new ScheduleRepository(prisma),
    private readonly activities = new ActivityRepository(prisma),
    private readonly users = new UserRepository(prisma),
    private readonly progress = new ProjectProgressService()
  ) {}

  async getScheduleByProjectId(projectId: string): Promise<ProjectSchedule> {
    const [project, activities, users, report] = await Promise.all([
      this.schedule.findProjectContext(projectId),
      this.activities.listByProject(projectId),
      this.users.listActive(),
      this.progress.getProjectProgressReport(projectId)
    ]);
    if (!project) throw new Error('El proyecto solicitado no existe.');

    return {
      project: {
        id: project.id,
        name: project.name,
        clientName: `${project.client.person.firstName} ${project.client.person.lastName}`.trim(),
        status: project.status as ProjectStatus,
        deliveryDate: project.deliveryDate?.toISOString() ?? null,
        hasApprovedQuote: project.quotes.some((quote) => quote.status === 'APPROVED'),
        isReadOnly: project.status === 'CLOSED' || project.status === 'ARCHIVED'
      },
      activities: activities.map(mapProjectActivity),
      responsibleUsers: users.map((user) => ({
        id: user.id,
        fullName: user.person
          ? `${user.person.firstName} ${user.person.lastName}`.trim()
          : user.username,
        role: user.role as UserRole
      })),
      report
    };
  }
}
