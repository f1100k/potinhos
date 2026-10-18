import type { Jar } from '../../types/model';
import { JAR_NAMES } from './jarNames';

const COLOR_CLASS: Readonly<Record<Jar, string>> = {
  simple: 'bg-chip-simple-bg text-chip-simple-fg',
  complex: 'bg-chip-complex-bg text-chip-complex-fg',
  weekly: 'bg-chip-weekly-bg text-chip-weekly-fg',
};

type Props = {
  jar: Jar;
};

export function JarChip({ jar }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-pill px-2.5 py-1 text-[12px] leading-none ${COLOR_CLASS[jar]}`}
    >
      {JAR_NAMES[jar]}
    </span>
  );
}
