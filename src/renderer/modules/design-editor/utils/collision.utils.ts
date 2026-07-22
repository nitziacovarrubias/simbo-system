import type { DesignModuleMutationInput } from '@shared/types';

function getFootprint(module: DesignModuleMutationInput): { width: number; depth: number } {
  const normalized = ((module.rotationY % 360) + 360) % 360;
  const swapsAxes = normalized === 90 || normalized === 270;
  return swapsAxes
    ? { width: module.depthMm, depth: module.widthMm }
    : { width: module.widthMm, depth: module.depthMm };
}

export function modulesOverlap(
  first: DesignModuleMutationInput,
  second: DesignModuleMutationInput
): boolean {
  const a = getFootprint(first);
  const b = getFootprint(second);
  return (
    Math.abs(first.positionX - second.positionX) * 2 < a.width + b.width &&
    Math.abs(first.positionZ - second.positionZ) * 2 < a.depth + b.depth
  );
}

export function markModuleCollisions(
  modules: DesignModuleMutationInput[]
): DesignModuleMutationInput[] {
  const collidingIds = new Set<string>();
  for (let firstIndex = 0; firstIndex < modules.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < modules.length; secondIndex += 1) {
      const first = modules[firstIndex];
      const second = modules[secondIndex];
      if (first && second && modulesOverlap(first, second)) {
        collidingIds.add(first.id);
        collidingIds.add(second.id);
      }
    }
  }
  return modules.map((module) => ({ ...module, hasCollision: collidingIds.has(module.id) }));
}
