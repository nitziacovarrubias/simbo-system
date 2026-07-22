import { prisma } from '../database/prisma';
import { MaterialRepository } from '../repositories/material.repository';
import { toMaterialListItem } from './mappers';
import type { DesignMaterialItem, MaterialListItem } from '../../shared/types';
import { MaterialUnit } from '../../shared/constants/domain.enums';

export class MaterialService {
  private readonly materials = new MaterialRepository(prisma);

  async listMaterials(): Promise<MaterialListItem[]> {
    return (await this.materials.listActive()).map(toMaterialListItem);
  }

  async getMaterials(): Promise<DesignMaterialItem[]> {
    return (await this.materials.listActive()).map((material) => ({
      id: material.id,
      code: material.code,
      name: material.name,
      category: material.category,
      unit: material.unit as MaterialUnit,
      costPerUnit: material.cost,
      thicknessMm: material.thicknessMm,
      colorHex: material.colorHex ?? '#81949C',
      textureName: material.texturePath,
      isActive: material.isActive
    }));
  }
}
