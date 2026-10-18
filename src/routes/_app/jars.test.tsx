import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../../app/store';
import { renderApp } from '../../test/renderApp';
import { seedData } from '../../test/seedData';

const MONDAY = new Date(2026, 9, 12, 10);
const SATURDAY = new Date(2026, 9, 17, 10);

describe('Home (Meus potes)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('shows the date and how many slips each jar has', async () => {
    seedData(MONDAY, {
      tasks: [
        { id: 'a', text: 'Lavar a louça', jar: 'simple' },
        { id: 'b', text: 'Regar as plantas', jar: 'simple' },
        { id: 'c', text: 'Correr', jar: 'weekly', freq: 3, doneWeek: 1 },
      ],
    });
    await renderApp('/jars');
    expect(screen.getByText('Segunda-feira, 12 de outubro')).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Pote Simples, 2 papeizinhos' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Pote Complexas, vazio' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Pote Semanal, 2 papeizinhos' }),
    ).toBeVisible();
    expect(screen.getByText('ainda vazio')).toBeVisible();
  });

  it('says "semana completa" when every weekly slip was done', async () => {
    seedData(MONDAY, {
      tasks: [{ id: 'c', text: 'Correr', jar: 'weekly', freq: 1, doneWeek: 1 }],
    });
    await renderApp('/jars');
    expect(
      screen.getByRole('button', { name: 'Pote Semanal, semana completa' }),
    ).toBeVisible();
  });

  it('drawing saves the slip and opens the draw screen', async () => {
    seedData(MONDAY, {
      tasks: [{ id: 'a', text: 'Lavar a louça', jar: 'simple' }],
    });
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Simples, 1 papelzinho' }),
    );
    expect(router.state.location.pathname).toBe('/jars/draw');
    expect(useAppData.getState().drawn).toEqual({
      taskId: 'a',
      date: '2026-10-12',
    });
  });

  it('an empty jar opens the empty screen', async () => {
    seedData(MONDAY, {});
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Complexas, vazio' }),
    );
    expect(router.state.location.pathname).toBe('/jars/empty');
    expect(router.state.location.search).toEqual({ jar: 'complex' });
  });

  it('with a slip already drawn today, any jar goes back to it', async () => {
    seedData(MONDAY, {
      tasks: [
        { id: 'a', text: 'Lavar a louça', jar: 'simple' },
        { id: 'b', text: 'Arrumar o armário', jar: 'complex' },
      ],
      drawn: { taskId: 'a', date: '2026-10-12' },
    });
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Complexas, 1 papelzinho' }),
    );
    expect(router.state.location.pathname).toBe('/jars/task');
    expect(useAppData.getState().drawn?.taskId).toBe('a');
  });

  it('shows the week card on the weekend when weekly slips are left', async () => {
    seedData(SATURDAY, {
      tasks: [{ id: 'c', text: 'Correr', jar: 'weekly', freq: 2, doneWeek: 1 }],
    });
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Fechar a semana' }),
    );
    expect(router.state.location.pathname).toBe('/jars/weekend');
  });

  it('hides the week card early in the week', async () => {
    seedData(MONDAY, {
      tasks: [{ id: 'c', text: 'Correr', jar: 'weekly', freq: 2 }],
    });
    await renderApp('/jars');
    expect(screen.queryByText(/A semana está acabando/)).toBeNull();
  });

  it('hides the week card when nothing is left in the weekly jar', async () => {
    seedData(SATURDAY, {
      tasks: [{ id: 'c', text: 'Correr', jar: 'weekly', freq: 1, doneWeek: 1 }],
    });
    await renderApp('/jars');
    expect(screen.queryByText(/A semana está acabando/)).toBeNull();
  });

  it('counts the saved achievements', async () => {
    seedData(MONDAY, {
      achievements: [
        { id: 'x', text: 'Lavar a louça', jar: 'simple', date: '2026-10-11' },
      ],
    });
    await renderApp('/jars');
    expect(
      screen.getByRole('link', {
        name: /Suas conquistas.*1 papelzinho guardado/,
      }),
    ).toBeVisible();
  });
});
