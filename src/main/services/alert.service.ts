import { prisma } from '../database/prisma';
import { AlertRepository } from '../repositories/alert.repository';
import { toAlertListItem } from './mappers';
import type { AlertListItem } from '../../shared/types';

export class AlertService {
  private readonly alerts = new AlertRepository(prisma);

  async listAlertsByProject(projectId: string): Promise<AlertListItem[]> {
    const alerts = await this.alerts.listByProject(projectId);
    return alerts.map(toAlertListItem);
  }
}
