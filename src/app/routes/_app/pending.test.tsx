import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../../../stores/appData';
import { TODAY } from '../../../testing/fixtures';
import { renderApp } from '../../../testing/renderApp';
import { seedData } from '../../../testing/seedData';
import type { Task } from '../../../types/model';

const AUNT: Task = {
  id: 'c',
  text: 'Ligar para a tia',
  jar: 'complex',
  status: 'pending',
};

describe('Pending', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('says so when nothing is pending', async () => {
    seedData(TODAY, {
      tasks: [{ id: 'a', text: 'Lavar a louça', jar: 'simple' }],
    });
    await renderApp('/pending');
    expect(
      screen.getByText('Coisas que ficaram esperando. Elas não têm pressa.'),
    ).toBeVisible();
    expect(screen.getByText('Nada pendente por aqui.')).toBeVisible();
  });

  it('resuming opens the task right away', async () => {
    seedData(TODAY, { tasks: [AUNT] });
    const router = await renderApp('/pending');
    await userEvent.click(
      screen.getByRole('button', { name: 'Retomar agora' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Sua tarefa de hoje' }),
    ).toBeVisible();
    expect(router.state.location.pathname).toBe('/jars/task');
    expect(screen.getByText('Ligar para a tia')).toBeVisible();
  });

  it('sends the slip back to any jar, with a toast', async () => {
    seedData(TODAY, { tasks: [AUNT] });
    await renderApp('/pending');
    await userEvent.click(screen.getByRole('button', { name: '→ Semanal' }));
    expect(useAppData.getState().tasks).toMatchObject([
      { id: 'c', jar: 'weekly', freq: 1 },
    ]);
    expect(useAppData.getState().tasks[0]?.status).toBeUndefined();
    expect(screen.getByText('Nada pendente por aqui.')).toBeVisible();
    expect(await screen.findByText('De volta ao pote Semanal.')).toBeVisible();
  });
});
