import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openDrawnTask } from '../../../test/flow';

describe('CurrentTask', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('shows the drawn task with its jar', async () => {
    await openDrawnTask();
    expect(
      screen.getByRole('heading', { name: 'Sua tarefa de hoje' }),
    ).toBeVisible();
    expect(screen.getByText('Lavar a louça')).toBeVisible();
    expect(screen.getByText('Simples')).toBeVisible();
    expect(
      screen.getByText('Tentar já conta. Um passinho de cada vez.'),
    ).toBeVisible();
  });

  it('Concluí opens the done screen', async () => {
    const router = await openDrawnTask();
    await userEvent.click(screen.getByRole('button', { name: 'Concluí' }));
    expect(router.state.location.pathname).toBe('/jars/done');
  });

  it('Não consegui hoje opens the not-done screen', async () => {
    const router = await openDrawnTask();
    await userEvent.click(
      screen.getByRole('button', { name: 'Não consegui hoje' }),
    );
    expect(router.state.location.pathname).toBe('/jars/not-done');
  });
});
