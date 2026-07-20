import { z } from 'zod';
import { roomSpaceSchema } from '../../shared/schemas';
import type { RoomOpening, RoomSpace, RoomSpaceInput } from '../../shared/types';

const legacyOpeningSchema = z.object({
  name: z.string().min(1),
  widthMm: z.number().positive(),
  positionMm: z.number().min(0),
  heightMm: z.number().positive().optional()
});

const legacyRoomSpaceSchema = z.object({
  shape: z.enum(['RECTANGULAR', 'L_SHAPE', 'U_SHAPE', 'CUSTOM']),
  widthMm: z.number().positive(),
  depthMm: z.number().positive(),
  heightMm: z.number().positive(),
  wallThicknessMm: z.number().positive().optional(),
  doors: z.array(legacyOpeningSchema).optional(),
  windows: z.array(legacyOpeningSchema).optional(),
  notes: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional()
});

function createLegacyOpenings(
  doors: z.infer<typeof legacyOpeningSchema>[] = [],
  windows: z.infer<typeof legacyOpeningSchema>[] = []
): RoomOpening[] {
  return [
    ...doors.map((opening) => ({ ...opening, type: 'DOOR' as const })),
    ...windows.map((opening) => ({ ...opening, type: 'WINDOW' as const }))
  ];
}

export function parseRoomSpaceJson(roomSpaceJson: string | null | undefined): RoomSpace | null {
  if (!roomSpaceJson) {
    return null;
  }

  try {
    const value: unknown = JSON.parse(roomSpaceJson);
    const currentResult = roomSpaceSchema.safeParse(value);

    if (currentResult.success) {
      const timestamp = new Date().toISOString();
      return {
        ...currentResult.data,
        openings: currentResult.data.openings ?? [],
        createdAt: currentResult.data.createdAt ?? timestamp,
        updatedAt: currentResult.data.updatedAt ?? timestamp
      };
    }

    const legacyResult = legacyRoomSpaceSchema.safeParse(value);
    if (!legacyResult.success) {
      return null;
    }

    const timestamp = new Date().toISOString();
    return {
      layoutType: legacyResult.data.shape,
      widthMm: legacyResult.data.widthMm,
      depthMm: legacyResult.data.depthMm,
      heightMm: legacyResult.data.heightMm,
      wallThicknessMm: legacyResult.data.wallThicknessMm,
      notes: legacyResult.data.notes,
      openings: createLegacyOpenings(legacyResult.data.doors, legacyResult.data.windows),
      createdAt: legacyResult.data.createdAt ?? timestamp,
      updatedAt: legacyResult.data.updatedAt ?? timestamp
    };
  } catch {
    return null;
  }
}

export function prepareRoomSpaceForSave(
  input: RoomSpaceInput,
  existingRoomSpaceJson?: string | null,
  now = new Date()
): RoomSpace {
  const parsed = roomSpaceSchema.parse(input);
  const existing = parseRoomSpaceJson(existingRoomSpaceJson);
  const timestamp = now.toISOString();

  return {
    ...parsed,
    openings: parsed.openings ?? [],
    createdAt: existing?.createdAt ?? parsed.createdAt ?? timestamp,
    updatedAt: timestamp
  };
}
