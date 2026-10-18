import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SOUNDS } from '../../../../../config/sounds';
import { TAP_GUARD_MS } from '../../../../../features/jars/components/SkipAnimation';
import { playSound } from '../../../../../lib/audio';
import { useAppData } from '../../../../../stores/appData';
import { openDrawnTask, waitMs } from '../../../../../testing/fixtures';

vi.mock('../../../../../lib/audio', () => ({
  playSound: vi.fn(() => () => {}),
}));

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

  it('shows the message right away when the animation is skipped', async () => {
    await openDone();
    await waitMs(TAP_GUARD_MS);
    await userEvent.click(
      screen.getByRole('button', { name: 'Pular animação' }),
    );
    expect(screen.getByText('Olha só você!')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Pular animação' })).toBeNull();
    // Lets the click guard expire, so the next test can click.
    await waitMs(TAP_GUARD_MS);
  });

  it('plays the fold, then the tap when the slip lands', async () => {
    vi.mocked(playSound).mockClear();
    await openDone();
    expect(playedUrls()).toEqual([SOUNDS.doneFold.url]);
    await waitMs(2900);
    expect(playedUrls()).toEqual([SOUNDS.doneFold.url, SOUNDS.doneTap.url]);
  });

  function playedUrls() {
    return vi.mocked(playSound).mock.calls.map(([url]) => url);
  }
});
