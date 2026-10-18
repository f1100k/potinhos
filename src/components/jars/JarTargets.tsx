import type { Jar } from '../../types/model';
import { JAR_NAMES } from './jarNames';

type Props = {
  jars: readonly Jar[];
  onPick: (jar: Jar) => void;
};

export function JarTargets({ jars, onPick }: Props) {
  return (
    <>
      {jars.map((jar) => (
        <button
          key={jar}
          type="button"
          onClick={() => onPick(jar)}
          className="min-h-10 rounded-pill border-[1.5px] border-border-soft bg-surface-muted px-3.5 py-2.25 text-[13.5px] text-text"
        >
          → {JAR_NAMES[jar]}
        </button>
      ))}
    </>
  );
}
