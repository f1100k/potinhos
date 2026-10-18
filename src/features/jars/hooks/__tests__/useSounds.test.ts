import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SOUNDS } from '../../../../config/sounds';
import { playSound } from '../../../../lib/audio';
import { dispatch, loadAppData, useAppData } from '../../../../stores/appData';
import { type SoundCue, useSounds } from '../useSounds';

vi.mock('../../../../lib/audio', () => ({ playSound: vi.fn() }));

const RUSTLE: SoundCue[] = [{ sound: 'drawRustle' }];
const UNFOLD: SoundCue[] = [{ sound: 'drawUnfold', delayMs: 300 }];

describe('useSounds', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppData.setState(loadAppData(localStorage), true);
    vi.mocked(playSound)
      .mockReset()
      .mockReturnValue(() => {});
  });

  it('plays each new list of cues', () => {
    const { rerender } = renderHook(({ cues }) => useSounds(cues), {
      initialProps: { cues: RUSTLE as SoundCue[] | undefined },
    });
    rerender({ cues: RUSTLE });
    rerender({ cues: undefined });
    rerender({ cues: UNFOLD });
    expect(vi.mocked(playSound).mock.calls).toEqual([
      [SOUNDS.drawRustle.url, SOUNDS.drawRustle.volume, undefined],
      [SOUNDS.drawUnfold.url, SOUNDS.drawUnfold.volume, 300],
    ]);
  });

  it('stays silent when sounds are off', () => {
    dispatch({ type: 'setSounds', on: false });
    renderHook(() => useSounds(RUSTLE));
    expect(playSound).not.toHaveBeenCalled();
  });

  it('stops what is playing when the screen closes', () => {
    const stop = vi.fn();
    vi.mocked(playSound).mockReturnValue(stop);
    const { rerender, unmount } = renderHook(({ cues }) => useSounds(cues), {
      initialProps: { cues: RUSTLE },
    });
    rerender({ cues: UNFOLD });
    expect(stop).not.toHaveBeenCalled();
    unmount();
    expect(stop).toHaveBeenCalledTimes(2);
  });
});
