export const MILLIMETERS_PER_CANVAS_UNIT = 1000;

export function millimetersToCanvasUnits(value: number): number {
  return value / MILLIMETERS_PER_CANVAS_UNIT;
}

export function canvasUnitsToMillimeters(value: number): number {
  return value * MILLIMETERS_PER_CANVAS_UNIT;
}
