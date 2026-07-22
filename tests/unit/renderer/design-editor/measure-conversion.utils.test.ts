import { describe, expect, it } from 'vitest';
import {
  canvasUnitsToMillimeters,
  millimetersToCanvasUnits
} from '@renderer/modules/design-editor/utils/measure-conversion.utils';

describe('measure conversion utils', () => {
  it('converts millimeters to canvas units', () => {
    expect(millimetersToCanvasUnits(2500)).toBe(2.5);
  });

  it('converts canvas units to millimeters', () => {
    expect(canvasUnitsToMillimeters(1.8)).toBe(1800);
  });
});
