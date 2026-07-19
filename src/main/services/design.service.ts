import { prisma } from '../database/prisma';
import { DesignRepository } from '../repositories/design.repository';
import { toDesignListItem } from './mappers';
import type { DesignListItem } from '../../shared/types';

export class DesignService {
  private readonly designs = new DesignRepository(prisma);

  async listDesignsByProject(projectId: string): Promise<DesignListItem[]> {
    const designs = await this.designs.listByProject(projectId);
    return designs.map(toDesignListItem);
  }
}
