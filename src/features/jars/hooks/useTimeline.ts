import { useEffect, useEffectEvent, useState } from 'react';

type Timeline<Phase extends string> = readonly (readonly [Phase, number])[];

/** Each entry is a phase and the ms after mount when it starts. */
export function usePhase<Phase extends string>(
  timeline: Timeline<Phase>,
): Phase {
  const [first] = timeline;
  if (!first) throw new Error('usePhase needs at least one phase');
  const [phase, setPhase] = useState<Phase>(first[0]);

  useEffect(() => {
    const timers = timeline.map(([next, startMs]) =>
      setTimeout(() => setPhase(next), startMs),
    );
    return () => timers.forEach(clearTimeout);
  }, [timeline]);

  return phase;
}

export function useAfter(ms: number, callback: () => void): void {
  const onTimeout = useEffectEvent(callback);
  useEffect(() => {
    const timer = setTimeout(onTimeout, ms);
    return () => clearTimeout(timer);
  }, [ms]);
}
