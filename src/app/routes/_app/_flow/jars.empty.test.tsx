import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TODAY } from '../../../../testing/fixtures';
import { renderApp } from '../../../../testing/renderApp';
import { seedData } from '../../../../testing/seedData';

describe('EmptyJar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('invites to put a task in the empty jar', async () => {
    seedData(TODAY);
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Complexas, vazio' }),
    );
    expect(
      await screen.findByRole('heading', {
        name: 'Esse pote está vazio por enquanto.',
      }),
    ).toBeVisible();
    await userEvent.click(
      screen.getByRole('link', { name: 'Colocar uma tarefa' }),
    );
    expect(router.state.location.pathname).toBe('/new-task');
    expect(router.state.location.search).toEqual({ jar: 'complex' });
  });

  it('celebrates a complete week, without the add button', async () => {
    seedData(TODAY, {
      tasks: [{ id: 'c', text: 'Correr', jar: 'weekly', freq: 1, doneWeek: 1 }],
    });
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Semanal, semana completa' }),
    );
    expect(
      await screen.findByRole('heading', {
        name: 'Semana completa. Que semana, hein?',
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Colocar uma tarefa' }),
    ).toBeNull();

    await userEvent.click(
      screen.getByRole('button', { name: 'Voltar aos potes' }),
    );
    expect(router.state.location.pathname).toBe('/jars');
  });
});
