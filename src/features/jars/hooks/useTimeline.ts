import { useCallback, useEffect, useEffectEvent, useState } from 'react';

type Timeline<Phase extends string> = readonly (readonly [Phase, number])[];

/**
 * Each entry is a phase and the ms after mount when it starts. The second
 * value jumps straight to the last phase.
 */
export function usePhase<Phase extends string>(
  timeline: Timeline<Phase>,
): readonly [Phase, () => void] {
  const first = timeline[0];
  const last = timeline.at(-1);
  if (!first || !last) throw new Error('usePhase needs at least one phase');
  const [phase, setPhase] = useState<Phase>(first[0]);
  const [skipped, setSkipped] = useState(false);

  useEffect(() => {
    if (skipped) return;
    const timers = timeline.map(([next, startMs]) =>
      setTimeout(() => setPhase(next), startMs),
    );
    return () => timers.forEach(clearTimeout);
  }, [timeline, skipped]);

  const lastPhase = last[0];
  const skipToEnd = useCallback(() => {
    setSkipped(true);
    setPhase(lastPhase);
  }, [lastPhase]);

  return [phase, skipToEnd];
}

export function useAfter(ms: number, callback: () => void): void {
  const onTimeout = useEffectEvent(callback);
  useEffect(() => {
    const timer = setTimeout(onTimeout, ms);
    return () => clearTimeout(timer);
  }, [ms]);
}
