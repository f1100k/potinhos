import { describe, expect, it } from 'vitest';
import { closeWeek, leftovers, remaining } from './rules';
import type { Task } from './types';

const w = (id: string, extra: Partial<Task> = {}): Task => ({
  id,
  text: id,
  jar: 'weekly',
  freq: 3,
  doneWeek: 1,
  extra: 0,
  ...extra,
});

const ids = () => {
  let n = 0;
  return () => `new-${++n}`;
};

describe('leftovers', () => {
  it('lists only active weekly tasks with remaining times', () => {
    const tasks: Task[] = [
      w('a'),
      w('b', { doneWeek: 3 }),
      w('c', { status: 'pending' }),
      w('d', { paused: true }),
      { id: 'e', text: 'e', jar: 'simple' },
    ];
    expect(leftovers(tasks).map((t) => t.id)).toEqual(['a']);
  });
});

describe('closeWeek', () => {
  it('carry is the default and keeps what was missing in extra', () => {
    const [a] = closeWeek([w('a')], {}, ids());
    expect(a).toMatchObject({ doneWeek: 0, extra: 2 });
    expect(a && remaining(a)).toBe(5);
  });

  it('pending creates a pending copy and carries no extra', () => {
    const r = closeWeek([w('a')], { a: 'pending' }, ids());
    expect(r).toEqual([
      { ...w('a'), doneWeek: 0, extra: 0 },
      { id: 'new-1', text: 'a', jar: 'weekly', status: 'pending' },
    ]);
  });

  it('drop just restarts the week', () => {
    const [a] = closeWeek([w('a', { extra: 2 })], { a: 'drop' }, ids());
    expect(a).toMatchObject({ doneWeek: 0, extra: 0 });
  });

  it('resets doneWeek for tasks that completed the week', () => {
    const [a] = closeWeek([w('a', { doneWeek: 3 })], {}, ids());
    expect(a).toMatchObject({ doneWeek: 0, extra: 0 });
  });

  it('leaves other jars and pending tasks alone', () => {
    const others: Task[] = [
      { id: 's', text: 's', jar: 'simple' },
      w('p', { status: 'pending' }),
    ];
    expect(closeWeek(others, {}, ids())).toEqual(others);
  });
});
