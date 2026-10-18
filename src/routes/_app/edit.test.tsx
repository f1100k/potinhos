import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../../app/store';
import type { Task } from '../../domain/types';
import { TODAY } from '../../test/flow';
import { renderApp } from '../../test/renderApp';
import { seedData } from '../../test/seedData';

const DISHES: Task = { id: 'a', text: 'Lavar a louça', jar: 'simple' };
const PLANTS: Task = { id: 'b', text: 'Regar as plantas', jar: 'simple' };
const AUNT: Task = {
  id: 'c',
  text: 'Ligar para a tia',
  jar: 'simple',
  status: 'pending',
};
const RUNNING: Task = {
  id: 'r',
  text: 'Correr',
  jar: 'weekly',
  freq: 2,
  doneWeek: 1,
  carriedOver: 0,
};

function item(text: string) {
  const element = screen.getByText(text).closest('li');
  if (!element) throw new Error(`no item for ${text}`);
  return within(element);
}

describe('Edit', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    seedData(TODAY, { tasks: [DISHES, PLANTS, AUNT, RUNNING] });
  });
  afterEach(() => vi.useRealTimers());

  it('lists the jar of the tab, without the pending slips', async () => {
    const router = await renderApp('/edit');
    expect(screen.getByText('Lavar a louça')).toBeVisible();
    expect(screen.getByText('Regar as plantas')).toBeVisible();
    expect(screen.queryByText('Ligar para a tia')).toBeNull();

    await userEvent.click(screen.getByRole('tab', { name: 'Complexas' }));
    expect(router.state.location.search).toEqual({ jar: 'complex' });
    expect(
      screen.getByText(
        'Esse pote está vazio por enquanto. Quando quiser, coloque algo nele.',
      ),
    ).toBeVisible();
  });

  it('edits the text inline', async () => {
    await renderApp('/edit');
    await userEvent.click(
      item('Lavar a louça').getByRole('button', { name: 'Editar' }),
    );
    const input = screen.getByRole('textbox', { name: 'Texto da tarefa' });
    expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, 'Lavar a louça do almoço{Enter}');
    expect(useAppData.getState().tasks[0]?.text).toBe(
      'Lavar a louça do almoço',
    );
    expect(screen.queryByRole('textbox')).toBeNull();
  });

  it('Escape gives up editing', async () => {
    await renderApp('/edit');
    await userEvent.click(
      item('Lavar a louça').getByRole('button', { name: 'Editar' }),
    );
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Texto da tarefa' }),
      ' xyz{Escape}',
    );
    expect(screen.getByText('Lavar a louça')).toBeVisible();
    expect(useAppData.getState().tasks[0]?.text).toBe('Lavar a louça');
  });

  it('moves to another jar with a toast', async () => {
    await renderApp('/edit');
    await userEvent.click(
      item('Lavar a louça').getByRole('button', { name: 'Mover de pote' }),
    );
    expect(screen.queryByRole('button', { name: '→ Simples' })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: '→ Complexas' }));
    expect(useAppData.getState().tasks[0]).toMatchObject({ jar: 'complex' });
    expect(screen.queryByText('Lavar a louça')).toBeNull();
    expect(
      await screen.findByText('Movido para o pote Complexas.'),
    ).toBeVisible();
  });

  it('deletes with an undo that puts the slip back in place', async () => {
    await renderApp('/edit');
    await userEvent.click(
      item('Lavar a louça').getByRole('button', { name: 'Excluir' }),
    );
    expect(screen.queryByText('Lavar a louça')).toBeNull();
    await userEvent.click(
      await screen.findByRole('button', { name: 'Desfazer' }),
    );
    expect(useAppData.getState().tasks.map((t) => t.id)).toEqual([
      'a',
      'b',
      'c',
      'r',
    ]);
  });

  it('weekly: frequency and pause, without "X de Y esta semana"', async () => {
    await renderApp('/edit?jar=weekly');
    expect(screen.getByText('2x por semana')).toBeVisible();
    expect(screen.queryByText(/esta semana/)).toBeNull();

    await userEvent.click(
      screen.getByRole('button', { name: 'Uma vez a mais por semana' }),
    );
    expect(screen.getByText('3x por semana')).toBeVisible();

    await userEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(screen.getByText('pausada')).toBeVisible();
    expect(screen.getByText('Correr').closest('li')).toHaveClass('opacity-55');
    expect(useAppData.getState().tasks[3]).toMatchObject({
      freq: 3,
      paused: true,
    });

    await userEvent.click(screen.getByRole('button', { name: 'Retomar' }));
    expect(screen.queryByText('pausada')).toBeNull();
  });
});
