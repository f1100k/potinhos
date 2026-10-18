import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { openDrawnTask } from '../../../test/flow';

async function openNotDone() {
  const router = await openDrawnTask();
  await userEvent.click(
    screen.getByRole('button', { name: 'Não consegui hoje' }),
  );
  await screen.findByRole('heading', { name: 'Tudo bem, amanhã é outro dia.' });
  return router;
}

describe('NotDone', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('offers to return, move or keep the slip as pending', async () => {
    await openNotDone();
    expect(
      await screen.findByRole('heading', {
        name: 'Tudo bem, amanhã é outro dia.',
      }),
    ).toBeVisible();
    expect(screen.getByText('Lavar a louça')).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Devolver ao pote Simples/ }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Mudar para outro pote/ }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Deixar como pendente/ }),
    ).toBeVisible();
  });

  it('returning goes to the return screen with the same jar', async () => {
    const router = await openNotDone();
    await userEvent.click(
      screen.getByRole('button', { name: /Devolver ao pote Simples/ }),
    );
    expect(router.state.location.pathname).toBe('/jars/return');
    expect(router.state.location.search).toEqual({ destination: 'simple' });
  });

  it('moving asks for one of the other jars, and can go back', async () => {
    const router = await openNotDone();
    await userEvent.click(
      screen.getByRole('button', { name: /Mudar para outro pote/ }),
    );
    expect(screen.getByText('Para qual pote?')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Simples' })).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    await userEvent.click(
      screen.getByRole('button', { name: /Mudar para outro pote/ }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Semanal' }));
    expect(router.state.location.search).toEqual({ destination: 'weekly' });
  });

  it('pending goes to the return screen', async () => {
    const router = await openNotDone();
    await userEvent.click(
      screen.getByRole('button', { name: /Deixar como pendente/ }),
    );
    expect(router.state.location.search).toEqual({ destination: 'pending' });
  });
});
