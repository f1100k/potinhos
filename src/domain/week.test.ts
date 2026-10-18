import { describe, expect, it } from 'vitest';
import type { Meta, Task } from './types';
import {
  closeWeek,
  closeWeekMeta,
  isWeekComplete,
  isWeekEnding,
  isWeekOverdue,
  leftovers,
  mondayOf,
  sundayOf,
} from './week';

const meta = (weekStart: string): Meta => ({
  visited: true,
  weekStart,
  lastWeekClosed: null,
});

// 2026-10-12 is a Monday; 2026-10-18 is a Sunday.
const at = (day: number, h = 12, m = 0) => new Date(2026, 9, day, h, m);

describe('mondayOf', () => {
  it('Monday is the Monday itself', () => {
    expect(mondayOf(at(12, 0, 0))).toBe('2026-10-12');
  });

  it('Sunday 23:59 is still the same week', () => {
    expect(mondayOf(at(18, 23, 59))).toBe('2026-10-12');
  });

  it('Monday 00:00 is already the next week', () => {
    expect(mondayOf(at(19, 0, 0))).toBe('2026-10-19');
  });

  it('crosses the month', () => {
    expect(mondayOf(new Date(2026, 10, 1))).toBe('2026-10-26');
  });

  it('sundayOf ends the week', () => {
    expect(sundayOf('2026-10-12')).toBe('2026-10-18');
  });
});

describe('isWeekOverdue', () => {
  it('is not overdue during the week', () => {
    expect(isWeekOverdue(meta('2026-10-12'), at(18, 23, 59))).toBe(false);
  });

  it('is overdue after Sunday 23:59', () => {
    expect(isWeekOverdue(meta('2026-10-12'), at(19, 0, 0))).toBe(true);
  });

  it('is still a single closing after several weeks', () => {
    const m = meta('2026-09-28');
    const now = at(19);
    expect(isWeekOverdue(m, now)).toBe(true);
    const after = closeWeekMeta(m, now);
    expect(after.weekStart).toBe('2026-10-19');
    expect(isWeekOverdue(after, now)).toBe(false);
  });
});

describe('isWeekEnding', () => {
  it('is false on Friday before 6 pm', () => {
    expect(isWeekEnding(meta('2026-10-12'), at(16, 17, 59))).toBe(false);
  });

  it('is true on Friday evening, Saturday and Sunday', () => {
    expect(isWeekEnding(meta('2026-10-12'), at(16, 18))).toBe(true);
    expect(isWeekEnding(meta('2026-10-12'), at(17))).toBe(true);
    expect(isWeekEnding(meta('2026-10-12'), at(18, 23))).toBe(true);
  });

  it('is false after closing the week early', () => {
    const closed = closeWeekMeta(meta('2026-10-12'), at(17));
    expect(closed.weekStart).toBe('2026-10-19');
    expect(closed.lastWeekClosed).toBe('2026-10-12');
    expect(isWeekEnding(closed, at(18))).toBe(false);
    expect(isWeekOverdue(closed, at(19, 9))).toBe(false);
  });
});

const weekly = (id: string, fields: Partial<Task> = {}): Task => ({
  id,
  text: id,
  jar: 'weekly',
  freq: 3,
  doneWeek: 1,
  carriedOver: 0,
  ...fields,
});

const sequentialIds = () => {
  let n = 0;
  return () => `new-${++n}`;
};

describe('isWeekComplete', () => {
  it('is true when everything in Weekly is done', () => {
    expect(isWeekComplete([weekly('a', { doneWeek: 3 })])).toBe(true);
  });

  it('is false when something is still left', () => {
    expect(isWeekComplete([weekly('a')])).toBe(false);
  });

  it('is false without weekly tasks', () => {
    expect(isWeekComplete([{ id: 's', text: 's', jar: 'simple' }])).toBe(false);
  });
});

describe('leftovers', () => {
  it('lists only active weekly tasks with remaining times', () => {
    const tasks: Task[] = [
      weekly('a'),
      weekly('b', { doneWeek: 3 }),
      weekly('c', { status: 'pending' }),
      weekly('d', { paused: true }),
      { id: 'e', text: 'e', jar: 'simple' },
    ];
    expect(leftovers(tasks).map((t) => t.id)).toEqual(['a']);
  });
});

describe('closeWeek', () => {
  it('carry is the default and keeps what was missing in carriedOver', () => {
    const [a] = closeWeek([weekly('a')], {}, sequentialIds());
    expect(a).toMatchObject({ doneWeek: 0, carriedOver: 2 });
  });

  it('pending creates a pending copy and carries nothing over', () => {
    const result = closeWeek([weekly('a')], { a: 'pending' }, sequentialIds());
    expect(result).toEqual([
      { ...weekly('a'), doneWeek: 0, carriedOver: 0 },
      { id: 'new-1', text: 'a', jar: 'weekly', status: 'pending' },
    ]);
  });

  it('drop just restarts the week', () => {
    const [a] = closeWeek(
      [weekly('a', { carriedOver: 2 })],
      { a: 'drop' },
      sequentialIds(),
    );
    expect(a).toMatchObject({ doneWeek: 0, carriedOver: 0 });
  });

  it('resets doneWeek for tasks that completed the week', () => {
    const [a] = closeWeek([weekly('a', { doneWeek: 3 })], {}, sequentialIds());
    expect(a).toMatchObject({ doneWeek: 0, carriedOver: 0 });
  });

  it('leaves other jars and pending tasks alone', () => {
    const others: Task[] = [
      { id: 's', text: 's', jar: 'simple' },
      weekly('p', { status: 'pending' }),
    ];
    expect(closeWeek(others, {}, sequentialIds())).toEqual(others);
  });
});
