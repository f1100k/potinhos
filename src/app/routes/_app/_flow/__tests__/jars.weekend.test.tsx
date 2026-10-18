import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../../../../../stores/appData';
import { renderApp } from '../../../../../testing/renderApp';
import { seedData } from '../../../../../testing/seedData';
import type { Task } from '../../../../../types/model';

const SATURDAY = new Date(2026, 9, 17, 10);
const NEXT_TUESDAY = new Date(2026, 9, 20, 10);

const RUNNING: Task = {
  id: 'run',
  text: 'Correr',
  jar: 'weekly',
  freq: 3,
  doneWeek: 1,
};
const STUDYING: Task = { id: 'study', text: 'Estudar', jar: 'weekly', freq: 2 };
const READING: Task = { id: 'read', text: 'Ler', jar: 'weekly', freq: 1 };

async function openFromHomeCard() {
  seedData(SATURDAY, { tasks: [RUNNING, STUDYING, READING] });
  const router = await renderApp('/jars');
  await userEvent.click(
    screen.getByRole('button', { name: 'Fechar a semana' }),
  );
  await screen.findByRole('heading', {
    name: 'Essa semana foi do jeito que deu.',
  });
  return router;
}

function decisionButton(task: string, label: string) {
  const group = screen.getByRole('group', {
    name: `O que fazer com “${task}”`,
  });
  const buttons = Array.from(group.querySelectorAll('button'));
  const button = buttons.find((b) => b.textContent === label);
  if (!button) throw new Error(`no "${label}" for ${task}`);
  return button;
}

describe('Weekend', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('lists the leftovers, with no count, and carries them by default', async () => {
    await openFromHomeCard();
    expect(screen.getByText('Pote Semanal')).toBeVisible();
    expect(screen.getByText('Correr')).toBeVisible();
    expect(screen.queryByText(/faltaram|faltou/)).toBeNull();
    expect(
      decisionButton('Correr', 'Levar para a próxima semana'),
    ).toHaveAttribute('aria-pressed', 'true');
    expect(decisionButton('Correr', 'Deixar ir')).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('closes the week with the chosen decisions', async () => {
    const router = await openFromHomeCard();
    await userEvent.click(decisionButton('Estudar', 'Deixar pendente'));
    await userEvent.click(decisionButton('Ler', 'Deixar ir'));
    expect(decisionButton('Ler', 'Deixar ir')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Fechar a semana' }),
    );

    const data = useAppData.getState();
    expect(data.meta).toMatchObject({
      weekStart: '2026-10-19',
      lastWeekClosed: '2026-10-12',
    });
    expect(data.tasks).toMatchObject([
      { id: 'run', doneWeek: 0, carriedOver: 2 },
      { id: 'study', doneWeek: 0, carriedOver: 0 },
      { id: 'read', doneWeek: 0, carriedOver: 0 },
      { text: 'Estudar', jar: 'weekly', status: 'pending' },
    ]);
    expect(router.state.location.pathname).toBe('/jars/new-week');
    expect(router.state.location.search).toEqual({ week: '2026-10-12' });
  });

  it('Depois goes home without closing', async () => {
    const router = await openFromHomeCard();
    await userEvent.click(screen.getByRole('button', { name: 'Depois' }));
    expect(router.state.location.pathname).toBe('/jars');
    expect(useAppData.getState().meta.weekStart).toBe('2026-10-12');
  });

  it('after the week turned, opens before the home only once', async () => {
    seedData(NEXT_TUESDAY, {
      tasks: [RUNNING],
      meta: { visited: true, weekStart: '2026-10-12', lastWeekClosed: null },
    });
    const router = await renderApp('/jars');
    expect(router.state.location.pathname).toBe('/jars/weekend');

    await userEvent.click(screen.getByRole('button', { name: 'Depois' }));
    expect(router.state.location.pathname).toBe('/jars');
    expect(
      await screen.findByText(/A semana passada ficou aberta/),
    ).toBeVisible();
  });

  it('closing several weeks late starts the current week', async () => {
    seedData(NEXT_TUESDAY, {
      tasks: [RUNNING],
      meta: { visited: true, weekStart: '2026-09-28', lastWeekClosed: null },
    });
    await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Fechar a semana' }),
    );
    expect(useAppData.getState().meta).toMatchObject({
      weekStart: '2026-10-19',
      lastWeekClosed: '2026-09-28',
    });
  });

  it('with nothing left, the week closes by itself', async () => {
    seedData(NEXT_TUESDAY, {
      tasks: [{ ...READING, doneWeek: 1 }],
      meta: { visited: true, weekStart: '2026-10-12', lastWeekClosed: null },
    });
    const router = await renderApp('/jars');
    expect(router.state.location.pathname).toBe('/jars');
    expect(useAppData.getState().meta.weekStart).toBe('2026-10-19');
    expect(
      screen.getByRole('button', { name: 'Pote Semanal, 1 papelzinho' }),
    ).toBeVisible();
  });
});
