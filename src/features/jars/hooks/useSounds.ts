import { useEffect, useRef } from 'react';
import { SOUNDS, type SoundName } from '../../../config/sounds';
import { playSound } from '../../../lib/audio';
import { useAppData } from '../../../stores/appData';

export type SoundCue = { sound: SoundName; delayMs?: number };

/**
 * Plays the cues whenever a new list arrives (keep each list a stable
 * constant). Sounds already playing go on until the screen closes.
 */
export function useSounds(cues: readonly SoundCue[] | undefined): void {
  const stops = useRef<(() => void)[]>([]);

  useEffect(() => {
    if (!cues || !useAppData.getState().settings.sounds) return;
    for (const { sound, delayMs } of cues) {
      const { url, volume } = SOUNDS[sound];
      stops.current.push(playSound(url, volume, delayMs));
    }
  }, [cues]);

  useEffect(
    () => () => {
      for (const stop of stops.current) stop();
      stops.current = [];
    },
    [],
  );
}
