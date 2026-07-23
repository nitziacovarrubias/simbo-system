export const EDGE_BANDING_OPTIONS = [
  'NONE',
  'LEFT',
  'RIGHT',
  'TOP',
  'BOTTOM',
  'ALL',
  'VISIBLE_EDGES'
] as const;

export type EdgeBanding = (typeof EDGE_BANDING_OPTIONS)[number];

export const EDGE_BANDING_LABELS: Record<EdgeBanding, string> = {
  NONE: 'Sin canteado',
  LEFT: 'Izquierdo',
  RIGHT: 'Derecho',
  TOP: 'Superior',
  BOTTOM: 'Inferior',
  ALL: 'Todos los cantos',
  VISIBLE_EDGES: 'Cantos visibles'
};
