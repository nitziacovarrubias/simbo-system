import { prisma } from '../database/prisma';
import { MaterialRepository } from '../repositories/material.repository';
import { toMaterialListItem } from './mappers';
import type { MaterialListItem } from '../../shared/types';

export class MaterialService {
  private readonly materials = new MaterialRepository(prisma);

  async listMaterials(): Promise<MaterialListItem[]> {
    const materials = await this.materials.listActive();
    return materials.map(toMaterialListItem);
  }
}
