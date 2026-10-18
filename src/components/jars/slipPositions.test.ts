import { describe, expect, it } from 'vitest';
import { slipPositions } from './slipPositions';

describe('slipPositions', () => {
  it('matches the prototype positions', () => {
    expect(slipPositions(3, 1)).toEqual([
      { left: 8, bottom: 5, rotateDeg: -15, delayS: 0 },
      { left: 37, bottom: 8, rotateDeg: 8, delayS: 0.22 },
      { left: 66, bottom: 5, rotateDeg: 1, delayS: 0.44 },
    ]);
  });

  it('scales left and bottom, but not the rotation', () => {
    const [, second] = slipPositions(2, 1.62);
    expect(second).toMatchObject({ left: 60, bottom: 13, rotateDeg: 8 });
  });

  it('shows at most 9 slips and none for an empty or negative count', () => {
    expect(slipPositions(40, 1)).toHaveLength(9);
    expect(slipPositions(0, 1)).toEqual([]);
    expect(slipPositions(-2, 1)).toEqual([]);
  });

  it('is deterministic', () => {
    expect(slipPositions(9, 1.25)).toEqual(slipPositions(9, 1.25));
  });
});
