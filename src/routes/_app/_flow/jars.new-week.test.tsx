import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { waitMs } from '../../../test/flow';
import { renderApp } from '../../../test/renderApp';
import { seedData } from '../../../test/seedData';

const SATURDAY = new Date(2026, 9, 17, 10);

async function closeTheWeek() {
  seedData(SATURDAY, {
    tasks: [{ id: 'run', text: 'Correr', jar: 'weekly', freq: 2, doneWeek: 1 }],
  });
  const router = await renderApp('/jars');
  await userEvent.click(
    screen.getByRole('button', { name: 'Fechar a semana' }),
  );
  await userEvent.click(
    await screen.findByRole('button', { name: 'Fechar a semana' }),
  );
  await screen.findByRole('heading', { name: 'Semana fechada.' });
  return router;
}

describe('NewWeek', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('refills the weekly jar and then invites to see the week', async () => {
    await closeTheWeek();
    expect(
      screen.getByText('O pote Semanal se enche de novo para a próxima.'),
    ).toBeVisible();
    expect(screen.queryByText(/Quer ver o que você fez/)).toBeNull();
    await waitMs(3200);
    expect(
      screen.getByText('Quer ver o que você fez essa semana?'),
    ).toBeVisible();
  });

  it('opens the achievements of the closed week', async () => {
    const router = await closeTheWeek();
    await waitMs(3200);
    await userEvent.click(
      screen.getByRole('button', { name: 'Abrir pote de conquistas' }),
    );
    expect(router.state.location.pathname).toBe('/achievements');
    expect(router.state.location.search).toEqual({
      tab: 'week',
      week: '2026-10-12',
    });
  });

  it('Agora não goes home', async () => {
    const router = await closeTheWeek();
    await waitMs(3200);
    await userEvent.click(screen.getByRole('button', { name: 'Agora não' }));
    expect(router.state.location.pathname).toBe('/jars');
  });
});
