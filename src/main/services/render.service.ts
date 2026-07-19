import { prisma } from '../database/prisma';
import { RenderRepository } from '../repositories/render.repository';
import { toRenderListItem } from './mappers';
import type { RenderListItem } from '../../shared/types';

export class RenderService {
  private readonly renders = new RenderRepository(prisma);

  async listRendersByProject(projectId: string): Promise<RenderListItem[]> {
    const renders = await this.renders.listByProject(projectId);
    return renders.map(toRenderListItem);
  }
}
