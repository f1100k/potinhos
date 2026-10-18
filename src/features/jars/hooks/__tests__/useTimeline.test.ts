import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAfter, usePhase } from '../useTimeline';

const TIMELINE = [
  ['wobble', 0],
  ['rise', 900],
  ['unfold', 2400],
] as const;

describe('usePhase', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('goes through the phases at the given times', () => {
    const { result } = renderHook(() => usePhase(TIMELINE)[0]);
    expect(result.current).toBe('wobble');
    act(() => vi.advanceTimersByTime(900));
    expect(result.current).toBe('rise');
    act(() => vi.advanceTimersByTime(1499));
    expect(result.current).toBe('rise');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('unfold');
  });

  it('jumps to the last phase and stops the timers when skipped', () => {
    const { result } = renderHook(() => usePhase(TIMELINE));
    act(() => result.current[1]());
    expect(result.current[0]).toBe('unfold');
    expect(vi.getTimerCount()).toBe(0);
  });

  it('stops the timers on unmount', () => {
    const { unmount } = renderHook(() => usePhase(TIMELINE));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('useAfter', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs the latest callback once, after the delay', () => {
    const first = vi.fn();
    const latest = vi.fn();
    const { rerender } = renderHook(
      ({ callback }) => useAfter(4000, callback),
      {
        initialProps: { callback: first },
      },
    );
    rerender({ callback: latest });
    act(() => vi.advanceTimersByTime(4000));
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledOnce();
  });

  it('does not run after unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useAfter(100, callback));
    unmount();
    act(() => vi.advanceTimersByTime(100));
    expect(callback).not.toHaveBeenCalled();
  });
});
