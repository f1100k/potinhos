import type { Jar } from '../domain/types';
import { slipPositions } from './slipPositions';

type JarKind = Jar | 'achievements';
type JarSize = 'xs' | 'sm' | 'md' | 'lg';

type Box = { left: number; top: number; width: number; height: number };

type Geometry = {
  width: number;
  height: number;
  lid: Box & { radius: string };
  neck: Box | null;
  body: { top: number; height: number };
  shine: Box | null;
  slip: { width: number; height: number; radius: number };
  slipScale: number;
};

const GEOMETRY: Readonly<Record<JarSize, Geometry>> = {
  xs: {
    width: 40,
    height: 46,
    lid: { left: 10, top: 0, width: 20, height: 7, radius: '4px 4px 2px 2px' },
    neck: null,
    body: { top: 9, height: 37 },
    shine: null,
    slip: { width: 11, height: 8, radius: 2 },
    slipScale: 0.4,
  },
  sm: {
    width: 96,
    height: 112,
    lid: { left: 24, top: 0, width: 48, height: 14, radius: '7px 7px 3px 3px' },
    neck: { left: 28, top: 12, width: 40, height: 12 },
    body: { top: 22, height: 90 },
    shine: { left: 10, top: 12, width: 10, height: 34 },
    slip: { width: 22, height: 15, radius: 3 },
    slipScale: 1,
  },
  md: {
    width: 120,
    height: 140,
    lid: { left: 30, top: 0, width: 60, height: 16, radius: '8px 8px 3px 3px' },
    neck: { left: 36, top: 14, width: 48, height: 14 },
    body: { top: 26, height: 114 },
    shine: { left: 12, top: 14, width: 12, height: 42 },
    slip: { width: 26, height: 18, radius: 3 },
    slipScale: 1.25,
  },
  lg: {
    width: 160,
    height: 186,
    lid: {
      left: 40,
      top: 0,
      width: 80,
      height: 20,
      radius: '10px 10px 4px 4px',
    },
    neck: { left: 48, top: 18, width: 64, height: 18 },
    body: { top: 34, height: 152 },
    shine: { left: 16, top: 20, width: 16, height: 56 },
    slip: { width: 35, height: 24, radius: 4 },
    slipScale: 1.62,
  },
};

const LID_CLASS: Readonly<Record<JarKind, string>> = {
  simple: 'bg-lid-simple',
  complex: 'bg-lid-complex',
  weekly: 'bg-lid-weekly',
  achievements: 'bg-lid-achievements',
};

type Tone = { border: string; glass: string; neck: string };

const NEUTRAL_TONE: Tone = {
  border: 'border-border',
  glass: 'from-surface-soft to-jar-end',
  neck: 'bg-surface-soft',
};

const TONE: Readonly<Record<JarKind, Tone>> = {
  simple: NEUTRAL_TONE,
  complex: NEUTRAL_TONE,
  weekly: {
    border: 'border-weekly-border',
    glass: 'from-surface-soft to-weekly-jar-end',
    neck: 'bg-surface-soft',
  },
  achievements: {
    border: 'border-achievements-jar-border',
    glass: 'from-achievements-jar-top to-achievements-jar-end',
    neck: 'bg-achievements-jar',
  },
};

const BODY_RADIUS = '50% 50% 46% 46% / 38% 38% 58% 58%';

type Props = {
  kind: JarKind;
  size: JarSize;
  slips: number;
  glow?: boolean;
  falling?: boolean;
  weekTag?: boolean;
};

export function JarIllustration({
  kind,
  size,
  slips,
  glow = false,
  falling = false,
  weekTag = false,
}: Props) {
  const geometry = GEOMETRY[size];
  const tone = TONE[kind];

  return (
    <div
      aria-hidden="true"
      className="relative flex-none"
      style={{ width: geometry.width, height: geometry.height }}
    >
      <div
        className={`absolute ${LID_CLASS[kind]}`}
        style={{ ...boxStyle(geometry.lid), borderRadius: geometry.lid.radius }}
      />
      {geometry.neck && (
        <div
          className={`absolute border-2 border-b-0 ${tone.border} ${tone.neck}`}
          style={boxStyle(geometry.neck)}
        />
      )}
      <div
        className={`absolute left-0 overflow-hidden border-2 bg-linear-to-b ${tone.border} ${tone.glass}`}
        style={{
          top: geometry.body.top,
          width: geometry.width,
          height: geometry.body.height,
          borderRadius: BODY_RADIUS,
          animation: glow ? 'glow 1.8s ease-out both' : undefined,
        }}
      >
        {slipPositions(slips, geometry.slipScale).map((position) => (
          <div
            key={`${position.left}-${position.bottom}`}
            className="absolute"
            style={{
              left: position.left,
              bottom: position.bottom,
              width: geometry.slip.width,
              height: geometry.slip.height,
              animation: falling
                ? `fallIn 1.3s cubic-bezier(.3,.6,.3,1) ${position.delayS}s both`
                : undefined,
            }}
          >
            <div
              className={`size-full border bg-surface ${tone.border}`}
              style={{
                borderRadius: geometry.slip.radius,
                transform: `rotate(${position.rotateDeg}deg)`,
              }}
            />
          </div>
        ))}
        {geometry.shine && (
          <div
            className="absolute rounded-[50%] bg-jar-shine"
            style={boxStyle(geometry.shine)}
          />
        )}
      </div>
      {weekTag && (
        <div className="absolute top-7.5 -right-1 origin-top-left rotate-6 animate-[sway_5s_ease-in-out_infinite] rounded-[4px] border border-weekly-border bg-weekly-bg px-1.75 py-0.75 text-[10px] whitespace-nowrap text-weekly-fg">
          esta semana
        </div>
      )}
    </div>
  );
}

function boxStyle(box: Box) {
  return {
    left: box.left,
    top: box.top,
    width: box.width,
    height: box.height,
  };
}
