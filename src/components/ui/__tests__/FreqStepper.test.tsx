import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { FreqStepper } from '../FreqStepper';

const formatFreq = (freq: number) => `${freq}x por semana`;

describe('FreqStepper', () => {
  it('shows the frequency and steps it by one', async () => {
    const onChange = vi.fn();
    render(
      <FreqStepper
        freq={3}
        onChange={onChange}
        size="sm"
        formatFreq={formatFreq}
      />,
    );
    expect(screen.getByText('3x por semana')).toBeVisible();
    await userEvent.click(
      screen.getByRole('button', { name: 'Uma vez a mais por semana' }),
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Uma vez a menos por semana' }),
    );
    expect(onChange.mock.calls).toEqual([[4], [2]]);
  });

  it('stops at 1 and at 7 times a week', () => {
    const { rerender } = render(
      <FreqStepper
        freq={1}
        onChange={() => {}}
        size="md"
        formatFreq={formatFreq}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Uma vez a menos por semana' }),
    ).toBeDisabled();
    rerender(
      <FreqStepper
        freq={7}
        onChange={() => {}}
        size="md"
        formatFreq={formatFreq}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'Uma vez a mais por semana' }),
    ).toBeDisabled();
  });
});
