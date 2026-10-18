import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../../../app/store';
import { openDrawnTask, waitMs } from '../../../test/flow';

async function openDone() {
  const router = await openDrawnTask();
  await userEvent.click(screen.getByRole('button', { name: 'Concluí' }));
  await screen.findByRole('heading', { name: 'Concluí' });
  return router;
}

describe('Done', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('saves the achievement right away and takes the slip out', async () => {
    await openDone();
    const data = useAppData.getState();
    expect(data.tasks).toEqual([]);
    expect(data.drawn).toBeNull();
    expect(data.achievements).toMatchObject([
      { text: 'Lavar a louça', jar: 'simple', date: '2026-10-14' },
    ]);
  });

  it('shows the message once the slip lands', async () => {
    await openDone();
    expect(screen.queryByText('Olha só você!')).toBeNull();
    await waitMs(3900);
    expect(screen.getByText('Olha só você!')).toBeVisible();
    expect(
      screen.getByText('Guardei esse no seu pote de conquistas.'),
    ).toBeVisible();
  });

  it('goes back to the jars or to the achievements', async () => {
    const router = await openDone();
    await waitMs(3900);
    await userEvent.click(
      screen.getByRole('button', { name: 'Ver conquistas' }),
    );
    expect(router.state.location.pathname).toBe('/achievements');
    expect(router.state.location.search).toEqual({ tab: 'week' });
  });

  it('Voltar aos potes goes home', async () => {
    const router = await openDone();
    await waitMs(3900);
    await userEvent.click(
      screen.getByRole('button', { name: 'Voltar aos potes' }),
    );
    expect(router.state.location.pathname).toBe('/jars');
  });
});
