import { describe, expect, it } from 'vitest';
import { addDays, fromISODate, toISODate } from './dates';
import { complete } from './rules';
import type { Task } from './types';

const tasks: Task[] = [
  { id: 's', text: 'Lavar a louça', jar: 'simple' },
  { id: 'c', text: 'Organizar as finanças', jar: 'complex' },
  {
    id: 'w',
    text: 'Caminhar',
    jar: 'weekly',
    freq: 3,
    doneWeek: 1,
    extra: 0,
  },
  { id: 'p', text: 'Ligar para a tia', jar: 'weekly', status: 'pending' },
];
const today = { id: 'k1', date: '2026-10-17' };

describe('complete', () => {
  it('removes Simple and Complex tasks from the list', () => {
    expect(complete(tasks, [], 's', today).tasks.map((t) => t.id)).toEqual([
      'c',
      'w',
      'p',
    ]);
    expect(
      complete(tasks, [], 'c', today).tasks.find((t) => t.id === 'c'),
    ).toBeUndefined();
  });

  it('in Weekly, counts one more time this week and keeps the task', () => {
    const r = complete(tasks, [], 'w', today);
    expect(r.tasks.find((t) => t.id === 'w')?.doneWeek).toBe(2);
  });

  it('removes a pending task even from Weekly', () => {
    const r = complete(tasks, [], 'p', today);
    expect(r.tasks.find((t) => t.id === 'p')).toBeUndefined();
  });

  it("records the achievement with today's date, newest first", () => {
    const before = [
      {
        id: 'k0',
        text: 'Antiga',
        jar: 'simple' as const,
        date: '2026-10-01',
      },
    ];
    const r = complete(tasks, before, 'w', today);
    expect(r.done).toEqual([
      { id: 'k1', text: 'Caminhar', jar: 'weekly', date: '2026-10-17' },
      before[0],
    ]);
  });

  it('ignores an unknown id', () => {
    const r = complete(tasks, [], 'x', today);
    expect(r.tasks).toEqual(tasks);
    expect(r.done).toEqual([]);
  });
});

describe('local dates', () => {
  it('formats without going through UTC', () => {
    expect(toISODate(new Date(2026, 9, 17, 23, 59))).toBe('2026-10-17');
  });

  it('parses and adds days', () => {
    expect(toISODate(fromISODate('2026-10-17'))).toBe('2026-10-17');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});
