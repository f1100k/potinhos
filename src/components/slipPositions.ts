const MAX_VISIBLE_SLIPS = 9;
const FALL_STAGGER_S = 0.22;

type SlipPosition = {
  left: number;
  bottom: number;
  rotateDeg: number;
  delayS: number;
};

export function slipPositions(count: number, scale: number): SlipPosition[] {
  const visible = Math.min(Math.max(0, count), MAX_VISIBLE_SLIPS);
  return Array.from({ length: visible }, (_, index) => ({
    left: Math.round((8 + ((index * 29) % 60)) * scale),
    bottom: Math.round(
      (5 + Math.floor(index / 3) * 13 + (index % 2) * 3) * scale,
    ),
    rotateDeg: ((index * 53) % 30) - 15,
    delayS: index * FALL_STAGGER_S,
  }));
}
