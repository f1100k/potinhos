import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../../../../../stores/appData';
import { openDrawnTask, waitMs } from '../../../../../testing/fixtures';

async function chooseNotDone(option: RegExp, jar?: string) {
  const router = await openDrawnTask();
  await userEvent.click(
    screen.getByRole('button', { name: 'Não consegui hoje' }),
  );
  await userEvent.click(await screen.findByRole('button', { name: option }));
  if (jar) await userEvent.click(screen.getByRole('button', { name: jar }));
  await screen.findByText('Guardando com calma…');
  return router;
}

describe('Return', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('returns the slip to its jar and goes home with a toast', async () => {
    const router = await chooseNotDone(/Devolver ao pote/);
    expect(screen.getByText('Guardando com calma…')).toBeVisible();
    expect(screen.getByText('Pote Simples')).toBeVisible();
    expect(useAppData.getState()).toMatchObject({
      tasks: [{ id: 'a', jar: 'simple' }],
      drawn: null,
    });

    await waitMs(2300);
    expect(router.state.location.pathname).toBe('/jars');
    expect(await screen.findByText('Guardado. Sem pressa.')).toBeVisible();
  });

  it('moves the slip to another jar', async () => {
    await chooseNotDone(/Mudar para outro pote/, 'Complexas');
    expect(screen.getByText('Pote Complexas')).toBeVisible();
    expect(useAppData.getState().tasks).toMatchObject([
      { id: 'a', jar: 'complex' },
    ]);
  });

  it('keeps the slip as pending', async () => {
    await chooseNotDone(/Deixar como pendente/);
    expect(screen.getByText('Pendentes')).toBeVisible();
    expect(useAppData.getState().tasks).toMatchObject([
      { id: 'a', jar: 'simple', status: 'pending' },
    ]);
  });
});
