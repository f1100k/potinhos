import { useState } from 'react';
import { swallowClicksFor } from '../../../lib/clickGuard';
import { useAfter } from '../hooks/useTimeline';

// A double tap on the button that opened the animation must not skip it, and
// the second tap of a skip must not land on the next screen.
export const TAP_GUARD_MS = 500;

type Props = {
  onSkip: () => void;
};

/** Covers the screen while an animation plays; one tap skips it. */
export function SkipAnimation({ onSkip }: Props) {
  const [armed, setArmed] = useState(false);
  useAfter(TAP_GUARD_MS, () => setArmed(true));

  return (
    <button
      type="button"
      aria-label="Pular animação"
      onClick={() => {
        if (!armed) return;
        swallowClicksFor(TAP_GUARD_MS);
        onSkip();
      }}
      className="absolute inset-0 z-1 cursor-default! rounded-card focus-visible:outline-offset-[-2px]"
    />
  );
}
