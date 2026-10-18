import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { SegmentedControl } from './SegmentedControl';

const TABS = [
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mês' },
] as const;

function Tabs() {
  const [tab, setTab] = useState<'week' | 'month'>('week');
  return (
    <SegmentedControl
      label="Período"
      options={TABS}
      value={tab}
      onChange={setTab}
    />
  );
}

describe('SegmentedControl', () => {
  it('marks the current option as selected', () => {
    render(<Tabs />);
    expect(screen.getByRole('tablist', { name: 'Período' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Esta semana' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('changes the option on click', async () => {
    render(<Tabs />);
    await userEvent.click(screen.getByRole('tab', { name: 'Este mês' }));
    expect(screen.getByRole('tab', { name: 'Este mês' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('moves with the arrow keys, wraps around and keeps a single tab stop', async () => {
    render(<Tabs />);
    await userEvent.tab();
    expect(screen.getByRole('tab', { name: 'Esta semana' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    const month = screen.getByRole('tab', { name: 'Este mês' });
    expect(month).toHaveFocus();
    expect(month).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Esta semana' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });
});
