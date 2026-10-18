import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SkipAnimation, TAP_GUARD_MS } from '../SkipAnimation';

describe('SkipAnimation', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('ignores taps right after it appears', async () => {
    const onSkip = vi.fn();
    render(<SkipAnimation onSkip={onSkip} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Pular animação' }),
    );
    expect(onSkip).not.toHaveBeenCalled();
  });

  it('skips with one tap and swallows the next one', async () => {
    const onSkip = vi.fn();
    const onNextScreen = vi.fn();
    render(
      <>
        <SkipAnimation onSkip={onSkip} />
        <button type="button" onClick={onNextScreen}>
          Concluí
        </button>
      </>,
    );
    await act(() => vi.advanceTimersByTimeAsync(TAP_GUARD_MS));

    await userEvent.click(
      screen.getByRole('button', { name: 'Pular animação' }),
    );
    expect(onSkip).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole('button', { name: 'Concluí' }));
    expect(onNextScreen).not.toHaveBeenCalled();

    await act(() => vi.advanceTimersByTimeAsync(TAP_GUARD_MS));
    await userEvent.click(screen.getByRole('button', { name: 'Concluí' }));
    expect(onNextScreen).toHaveBeenCalledOnce();
  });
});
