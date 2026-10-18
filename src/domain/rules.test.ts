import { describe, expect, it } from 'vitest';
import { count, draw, isWeekComplete, pool, remaining } from './rules';
import type { Task } from './types';

const simple = (id: string, extra: Partial<Task> = {}): Task => ({
  id,
  text: id,
  jar: 'simple',
  ...extra,
});

const weekly = (id: string, extra: Partial<Task> = {}): Task => ({
  id,
  text: id,
  jar: 'weekly',
  freq: 2,
  doneWeek: 0,
  extra: 0,
  ...extra,
});

describe('remaining', () => {
  it('is freq + extra − doneWeek', () => {
    expect(remaining(weekly('a', { freq: 3, extra: 1, doneWeek: 2 }))).toBe(2);
  });

  it('is never negative', () => {
    expect(remaining(weekly('a', { freq: 1, doneWeek: 3 }))).toBe(0);
  });

  it('is zero when the task is paused', () => {
    expect(remaining(weekly('a', { paused: true }))).toBe(0);
  });

  it('treats missing fields as zero', () => {
    expect(remaining(simple('a'))).toBe(0);
  });
});

describe('pool', () => {
  it('ignores pending tasks and other jars', () => {
    const tasks = [
      simple('a'),
      simple('b', { status: 'pending' }),
      { ...simple('c'), jar: 'complex' as const },
    ];
    expect(pool(tasks, 'simple').map((t) => t.id)).toEqual(['a']);
  });

  it('in Weekly, only includes tasks with remaining times', () => {
    const tasks = [
      weekly('a'),
      weekly('b', { doneWeek: 2 }),
      weekly('c', { paused: true }),
    ];
    expect(pool(tasks, 'weekly').map((t) => t.id)).toEqual(['a']);
  });
});

describe('count', () => {
  it('is the pool size in Simple and Complex', () => {
    expect(count([simple('a'), simple('b')], 'simple')).toBe(2);
  });

  it('is the sum of remaining times in Weekly', () => {
    const tasks = [weekly('a', { freq: 3 }), weekly('b', { doneWeek: 1 })];
    expect(count(tasks, 'weekly')).toBe(4);
  });
});

describe('draw', () => {
  const tasks = [simple('a'), simple('b'), simple('c')];

  it('returns null when the jar is empty', () => {
    expect(draw(tasks, 'complex')).toBeNull();
  });

  it('picks by the random number, uniformly', () => {
    expect(draw(tasks, 'simple', () => 0)?.id).toBe('a');
    expect(draw(tasks, 'simple', () => 0.5)?.id).toBe('b');
    expect(draw(tasks, 'simple', () => 0.99)?.id).toBe('c');
  });

  it('does not overflow with random() = 1', () => {
    expect(draw(tasks, 'simple', () => 1)?.id).toBe('c');
  });

  it('draws each task about equally often', () => {
    const times: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 3000; i++) {
      const t = draw(tasks, 'simple', () => i / 3000);
      if (t) times[t.id] = (times[t.id] ?? 0) + 1;
    }
    expect(times).toEqual({ a: 1000, b: 1000, c: 1000 });
  });
});

describe('isWeekComplete', () => {
  it('is true when everything in Weekly is done', () => {
    expect(isWeekComplete([weekly('a', { doneWeek: 2 })])).toBe(true);
  });

  it('is false when something is still left', () => {
    expect(isWeekComplete([weekly('a', { doneWeek: 1 })])).toBe(false);
  });

  it('is false without weekly tasks', () => {
    expect(isWeekComplete([simple('a')])).toBe(false);
  });
});
