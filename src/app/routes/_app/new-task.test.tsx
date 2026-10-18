import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../../../stores/appData';
import { TODAY } from '../../../testing/fixtures';
import { renderApp } from '../../../testing/renderApp';
import { seedData } from '../../../testing/seedData';

function taskInput() {
  return screen.getByRole('textbox', { name: 'O que você quer guardar?' });
}

describe('NewTask', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    seedData(TODAY);
  });
  afterEach(() => vi.useRealTimers());

  it('focuses the text field and saves to the simple jar with Enter', async () => {
    const router = await renderApp('/new-task');
    expect(taskInput()).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Simples' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.type(taskInput(), '  Lavar a louça {Enter}');

    expect(useAppData.getState().tasks).toMatchObject([
      { text: 'Lavar a louça', jar: 'simple' },
    ]);
    expect(router.state.location.pathname).toBe('/jars');
    expect(
      await screen.findByText('Papelzinho guardado no pote Simples.'),
    ).toBeVisible();
  });

  it('asks gently for the text when it is empty', async () => {
    const router = await renderApp('/new-task');
    await userEvent.click(
      screen.getByRole('button', { name: 'Colocar no pote' }),
    );
    expect(
      await screen.findByText('Escreva a tarefa primeiro, sem pressa.'),
    ).toBeVisible();
    expect(useAppData.getState().tasks).toEqual([]);
    expect(router.state.location.pathname).toBe('/new-task');
  });

  it('asks how many times a week for the weekly jar, 2 by default', async () => {
    await renderApp('/new-task');
    expect(screen.queryByText('Quantas vezes por semana?')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Semanal' }));
    expect(screen.getByText('Quantas vezes por semana?')).toBeVisible();
    expect(screen.getByText('2x')).toBeVisible();

    await userEvent.click(
      screen.getByRole('button', { name: 'Uma vez a mais por semana' }),
    );
    await userEvent.type(taskInput(), 'Correr');
    await userEvent.click(
      screen.getByRole('button', { name: 'Colocar no pote' }),
    );
    expect(useAppData.getState().tasks).toMatchObject([
      { text: 'Correr', jar: 'weekly', freq: 3, doneWeek: 0 },
    ]);
  });

  it('starts on the jar given in the URL', async () => {
    await renderApp('/new-task?jar=complex');
    expect(screen.getByRole('button', { name: 'Complexas' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
