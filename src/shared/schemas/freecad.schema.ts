import { z } from 'zod';
import { DESIGN_MODULE_TYPES } from './design-module.schema';
import { ROOM_LAYOUT_TYPES } from './room-space.schema';

const positiveMeasure = z.number().finite().positive().max(100_000);
const finitePosition = z.number().finite().min(-100_000).max(100_000);

export const freeCadInputSchema = z.object({
  project: z.object({
    id: z.string().min(1).max(256),
    name: z.string().trim().min(1).max(200),
    units: z.literal('mm')
  }),
  room: z.object({
    layoutType: z.enum(ROOM_LAYOUT_TYPES),
    widthMm: positiveMeasure,
    depthMm: positiveMeasure,
    heightMm: positiveMeasure
  }),
  modules: z
    .array(
      z.object({
        id: z.string().min(1).max(256),
        type: z.enum(DESIGN_MODULE_TYPES),
        name: z.string().trim().min(1).max(200),
        widthMm: positiveMeasure,
        heightMm: positiveMeasure,
        depthMm: positiveMeasure,
        positionX: finitePosition,
        positionY: finitePosition,
        positionZ: finitePosition,
        rotationY: z.number().finite().min(-3600).max(3600),
        material: z.object({
          name: z.string().trim().min(1).max(200),
          thicknessMm: z.number().finite().positive().max(100),
          colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/)
        })
      })
    )
    .min(1, 'El diseño necesita al menos un módulo para generar CAD.')
});

export const freeCadOutputSchema = z.object({
  success: z.literal(true),
  files: z.object({
    fcstd: z.string().min(1),
    step: z.string().min(1),
    stl: z.string().min(1),
    obj: z.string().min(1).nullable()
  }),
  warnings: z.array(z.string()),
  generatedAt: z.string().datetime()
});
