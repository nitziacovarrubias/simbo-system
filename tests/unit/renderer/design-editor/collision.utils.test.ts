import { describe, expect, it } from 'vitest';
import type { DesignModuleMutationInput } from '@shared/types';
import {
  markModuleCollisions,
  modulesOverlap
} from '@renderer/modules/design-editor/utils/collision.utils';

function moduleAt(id: string, x: number, z: number): DesignModuleMutationInput {
  return {
    id,
    templateId: 'template-1',
    type: 'BASE_CABINET',
    displayName: id,
    positionX: x,
    positionY: 0,
    positionZ: z,
    widthMm: 800,
    heightMm: 720,
    depthMm: 560,
    rotationY: 0,
    materialId: null,
    colorHex: '#FFFFFF',
    notes: '',
    hasCollision: false
  };
}

describe('collision utils', () => {
  it('detects overlapping module footprints', () => {
    expect(modulesOverlap(moduleAt('a', 1000, 1000), moduleAt('b', 1500, 1000))).toBe(true);
  });

  it('marks only colliding modules', () => {
    const result = markModuleCollisions([
      moduleAt('a', 1000, 1000),
      moduleAt('b', 1500, 1000),
      moduleAt('c', 2800, 2000)
    ]);
    expect(result.find((item) => item.id === 'a')?.hasCollision).toBe(true);
    expect(result.find((item) => item.id === 'b')?.hasCollision).toBe(true);
    expect(result.find((item) => item.id === 'c')?.hasCollision).toBe(false);
  });
});
