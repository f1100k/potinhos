import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../../../../testing/renderApp';
import { seedData } from '../../../../testing/seedData';
import type { Achievement, Jar } from '../../../../types/model';

const THURSDAY = new Date(2026, 9, 15, 10);

function done(id: string, text: string, jar: Jar, date: string): Achievement {
  return { id, text, jar, date };
}

const ACHIEVEMENTS = [
  done('1', 'Lavar a louça', 'simple', '2026-10-14'),
  done('2', 'Correr', 'weekly', '2026-10-12'),
  done('3', 'Arrumar o armário', 'complex', '2026-10-08'),
  done('4', 'Pagar a conta de luz', 'simple', '2026-09-30'),
];

function listedTexts() {
  const list = screen.queryByRole('list');
  if (!list) return [];
  return within(list)
    .getAllByRole('listitem')
    .map((item) => item.firstElementChild?.firstElementChild?.textContent);
}

describe('Achievements', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('this week shows Monday to Sunday, newest first', async () => {
    seedData(THURSDAY, { achievements: ACHIEVEMENTS });
    await renderApp('/achievements?tab=week');
    expect(screen.getByRole('heading', { name: 'Sua semana' })).toBeVisible();
    expect(screen.getByText('Papeizinhos guardados, um a um.')).toBeVisible();
    expect(listedTexts()).toEqual(['Lavar a louça', 'Correr']);
    expect(screen.getByText('14 de out.')).toBeVisible();
    expect(screen.getByText('Semanal')).toBeVisible();
    expect(
      screen.getByText(
        'Olha tudo que você fez essa semana, mesmo nos dias difíceis.',
      ),
    ).toBeInTheDocument();
  });

  it('this month shows the calendar month', async () => {
    seedData(THURSDAY, { achievements: ACHIEVEMENTS });
    await renderApp('/achievements?tab=month');
    expect(screen.getByRole('heading', { name: 'Seu mês' })).toBeVisible();
    expect(listedTexts()).toEqual([
      'Lavar a louça',
      'Correr',
      'Arrumar o armário',
    ]);
    expect(
      screen.getByText(
        'Olha tudo que você fez esse mês, mesmo nos dias difíceis.',
      ),
    ).toBeInTheDocument();
  });

  it('opens a given week, like the one just closed', async () => {
    seedData(THURSDAY, { achievements: ACHIEVEMENTS });
    await renderApp('/achievements?tab=week&week=2026-10-05');
    expect(listedTexts()).toEqual(['Arrumar o armário']);
  });

  it('switching tabs updates the URL', async () => {
    seedData(THURSDAY, { achievements: ACHIEVEMENTS });
    const router = await renderApp('/achievements?tab=week&week=2026-10-05');
    await userEvent.click(screen.getByRole('tab', { name: 'Este mês' }));
    expect(router.state.location.search).toEqual({ tab: 'month' });
    expect(screen.getByRole('heading', { name: 'Seu mês' })).toBeVisible();
  });

  it('is gentle when there is nothing yet', async () => {
    seedData(THURSDAY);
    await renderApp('/achievements?tab=week');
    expect(
      screen.getByText('Aqui vão morar as coisas que você fizer.'),
    ).toBeVisible();
    expect(screen.queryByText('Papeizinhos guardados, um a um.')).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('only animates the first 12 slips of a long list', async () => {
    const many = Array.from({ length: 15 }, (_, index) =>
      done(`m${index}`, `Tarefa ${index}`, 'simple', '2026-10-13'),
    );
    seedData(THURSDAY, { achievements: many });
    await renderApp('/achievements?tab=week');
    const cards = screen
      .getAllByRole('listitem')
      .map((item) => item.firstElementChild as HTMLElement);
    expect(cards[11]?.style.animation).toMatch(/unfoldIn/);
    expect(cards[12]?.style.animation).toBe('');
  });

  it('‹ Potes goes back to the jars', async () => {
    seedData(THURSDAY);
    const router = await renderApp('/achievements?tab=week');
    await userEvent.click(screen.getByRole('link', { name: '‹ Potes' }));
    expect(router.state.location.pathname).toBe('/jars');
  });
});
