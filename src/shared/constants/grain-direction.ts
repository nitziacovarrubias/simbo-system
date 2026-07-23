export const GRAIN_DIRECTIONS = ['VERTICAL', 'HORIZONTAL', 'NONE'] as const;

export type GrainDirection = (typeof GRAIN_DIRECTIONS)[number];

export const GRAIN_DIRECTION_LABELS: Record<GrainDirection, string> = {
  VERTICAL: 'Vertical',
  HORIZONTAL: 'Horizontal',
  NONE: 'Sin orientación'
};
