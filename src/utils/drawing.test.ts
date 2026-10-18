import { describe, expect, it } from 'vitest';
import type { Task } from '../types/model';
import { draw, drawPool, slipCount } from './drawing';

const simple = (id: string, fields: Partial<Task> = {}): Task => ({
  id,
  text: id,
  jar: 'simple',
  ...fields,
});

const weekly = (id: string, fields: Partial<Task> = {}): Task => ({
  id,
  text: id,
  jar: 'weekly',
  freq: 2,
  doneWeek: 0,
  carriedOver: 0,
  ...fields,
});

describe('drawPool', () => {
  it('ignores pending tasks and other jars', () => {
    const tasks = [
      simple('a'),
      simple('b', { status: 'pending' }),
      simple('c', { jar: 'complex' }),
    ];
    expect(drawPool(tasks, 'simple').map((t) => t.id)).toEqual(['a']);
  });

  it('in Weekly, only includes tasks with remaining times', () => {
    const tasks = [
      weekly('a'),
      weekly('b', { doneWeek: 2 }),
      weekly('c', { paused: true }),
    ];
    expect(drawPool(tasks, 'weekly').map((t) => t.id)).toEqual(['a']);
  });
});

describe('slipCount', () => {
  it('is the pool size in Simple and Complex', () => {
    expect(slipCount([simple('a'), simple('b')], 'simple')).toBe(2);
  });

  it('is the sum of remaining times in Weekly', () => {
    const tasks = [weekly('a', { freq: 3 }), weekly('b', { doneWeek: 1 })];
    expect(slipCount(tasks, 'weekly')).toBe(4);
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
      const task = draw(tasks, 'simple', () => i / 3000);
      if (task) times[task.id] = (times[task.id] ?? 0) + 1;
    }
    expect(times).toEqual({ a: 1000, b: 1000, c: 1000 });
  });
});
