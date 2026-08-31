export const RENDER_RESOLUTION_PRESETS = {
  HD: { width: 1280, height: 720, label: 'HD (1280 × 720)' },
  FULL_HD: { width: 1920, height: 1080, label: 'Full HD (1920 × 1080)' },
  TWO_K: { width: 2560, height: 1440, label: '2K (2560 × 1440)' },
  FOUR_K: { width: 3840, height: 2160, label: '4K (3840 × 2160)' }
} as const;

export const RENDER_RESOLUTION_KEYS = ['HD', 'FULL_HD', 'TWO_K', 'FOUR_K'] as const;

export const RENDER_IMAGE_FORMATS = ['PNG', 'JPEG'] as const;
export const RENDER_VIEW_TYPES = ['ISOMETRIC', 'FRONT', 'TOP', 'CUSTOM'] as const;
export const RENDER_QUALITY_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as const;

export type RenderResolutionPreset = keyof typeof RENDER_RESOLUTION_PRESETS;
export type RenderImageFormat = (typeof RENDER_IMAGE_FORMATS)[number];
export type RenderViewType = (typeof RENDER_VIEW_TYPES)[number];
export type RenderQuality = (typeof RENDER_QUALITY_LEVELS)[number];
