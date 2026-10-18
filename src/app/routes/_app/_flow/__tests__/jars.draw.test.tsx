import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SOUNDS } from '../../../../../config/sounds';
import { TAP_GUARD_MS } from '../../../../../features/jars/components/SkipAnimation';
import { playSound } from '../../../../../lib/audio';
import { DISHES, TODAY, waitMs } from '../../../../../testing/fixtures';
import { renderApp } from '../../../../../testing/renderApp';
import { seedData } from '../../../../../testing/seedData';

vi.mock('../../../../../lib/audio', () => ({
  playSound: vi.fn(() => () => {}),
}));

describe('Draw', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('shakes the jar, unfolds the slip and opens the task', async () => {
    seedData(TODAY, { tasks: [DISHES] });
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Simples, 1 papelzinho' }),
    );

    expect(
      await screen.findByText('Deixa eu ver o que tem aqui…'),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Sorteado agora. Não dá para sortear de novo, e tudo bem.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('Lavar a louça')).toBeNull();

    await waitMs(900);
    expect(screen.getByText('Saiu um papelzinho.')).toBeVisible();

    await waitMs(1500);
    expect(screen.getByText('Olha só o que veio.')).toBeVisible();
    expect(screen.getByText('Lavar a louça')).toBeInTheDocument();

    await waitMs(1600);
    expect(router.state.location.pathname).toBe('/jars/task');
  });

  it('opens the task right away when the animation is skipped', async () => {
    seedData(TODAY, { tasks: [DISHES] });
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Simples, 1 papelzinho' }),
    );
    await waitMs(TAP_GUARD_MS);
    await userEvent.click(
      screen.getByRole('button', { name: 'Pular animação' }),
    );
    expect(router.state.location.pathname).toBe('/jars/task');
    // Lets the click guard expire, so the next test can click.
    await waitMs(TAP_GUARD_MS);
  });

  it('rustles while the jar shakes and unfolds with the slip', async () => {
    vi.mocked(playSound).mockClear();
    seedData(TODAY, { tasks: [DISHES] });
    await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Simples, 1 papelzinho' }),
    );
    await screen.findByText('Deixa eu ver o que tem aqui…');
    expect(playedUrls()).toEqual([SOUNDS.drawRustle.url]);
    await waitMs(2400);
    expect(playedUrls()).toEqual([
      SOUNDS.drawRustle.url,
      SOUNDS.drawUnfold.url,
    ]);
  });

  function playedUrls() {
    return vi.mocked(playSound).mock.calls.map(([url]) => url);
  }
});
