import { encode } from 'uqr';

const QUIET_ZONE = 2;

type Props = {
  value: string;
  label: string;
  size: number;
};

export function QrCode({ value, label, size }: Props) {
  const { data } = encode(value, { ecc: 'M', border: QUIET_ZONE });
  const modules = data.length;
  const path = data
    .flatMap((row, y) =>
      row.map((dark, x) => (dark ? `M${x} ${y}h1v1h-1z` : '')),
    )
    .join('');

  return (
    <svg
      role="img"
      aria-label={label}
      width={size}
      height={size}
      viewBox={`0 0 ${modules} ${modules}`}
      shapeRendering="crispEdges"
      className="rounded-sm bg-surface"
    >
      <path d={path} className="fill-text" />
    </svg>
  );
}
