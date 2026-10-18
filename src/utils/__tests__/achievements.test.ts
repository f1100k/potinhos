import { describe, expect, it } from 'vitest';
import type { Achievement } from '../../types/model';
import { achievementsOfMonth, achievementsOfWeek } from '../achievements';

function on(date: string): Achievement {
  return { id: date, text: 'Lavar a louça', jar: 'simple', date };
}

const ACHIEVEMENTS = [
  on('2026-10-19'),
  on('2026-10-18'),
  on('2026-10-12'),
  on('2026-10-11'),
  on('2026-09-30'),
];

describe('achievementsOfWeek', () => {
  it('keeps Monday to Sunday of the given week, in the same order', () => {
    expect(
      achievementsOfWeek(ACHIEVEMENTS, '2026-10-12').map((a) => a.date),
    ).toEqual(['2026-10-18', '2026-10-12']);
  });

  it('is empty for a week with nothing done', () => {
    expect(achievementsOfWeek(ACHIEVEMENTS, '2026-10-26')).toEqual([]);
  });
});

describe('achievementsOfMonth', () => {
  it('keeps the calendar month of the given day', () => {
    expect(
      achievementsOfMonth(ACHIEVEMENTS, new Date(2026, 9, 1)).map(
        (a) => a.date,
      ),
    ).toEqual(['2026-10-19', '2026-10-18', '2026-10-12', '2026-10-11']);
  });
});
