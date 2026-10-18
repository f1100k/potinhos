import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { JarTargets } from './JarTargets';

describe('JarTargets', () => {
  it('offers the given jars and tells which one was picked', async () => {
    const onPick = vi.fn();
    render(<JarTargets jars={['complex', 'weekly']} onPick={onPick} />);
    expect(screen.queryByRole('button', { name: '→ Simples' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: '→ Semanal' }));
    expect(onPick).toHaveBeenCalledWith('weekly');
  });
});
