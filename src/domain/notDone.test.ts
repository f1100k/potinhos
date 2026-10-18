import { describe, expect, it } from 'vitest';
import { moveToJar, notDone, returnToJar } from './rules';
import type { Task } from './types';

const simple: Task = { id: 's', text: 'Lavar a louça', jar: 'simple' };
const weekly: Task = {
  id: 'w',
  text: 'Caminhar',
  jar: 'weekly',
  freq: 3,
  doneWeek: 2,
  extra: 1,
};

describe('moveToJar', () => {
  it('starts at once a week when entering Weekly', () => {
    expect(moveToJar(simple, 'weekly')).toEqual({
      id: 's',
      text: 'Lavar a louça',
      jar: 'weekly',
      freq: 1,
      doneWeek: 0,
      extra: 0,
    });
  });

  it('drops the weekly fields when leaving Weekly', () => {
    expect(moveToJar(weekly, 'complex')).toEqual({
      id: 'w',
      text: 'Caminhar',
      jar: 'complex',
    });
  });

  it('resets doneWeek and extra and keeps the status', () => {
    const t = moveToJar({ ...weekly, status: 'pending' }, 'weekly');
    expect(t).toMatchObject({ doneWeek: 0, extra: 0, status: 'pending' });
  });
});

describe('returnToJar', () => {
  it('clears pending and keeps the jar', () => {
    const t = returnToJar({ ...simple, status: 'pending' }, 'simple');
    expect(t).toEqual(simple);
  });
});

describe('notDone', () => {
  const tasks = [simple, weekly];

  it('return keeps it in the same jar', () => {
    expect(notDone(tasks, 's', { kind: 'return' })).toEqual(tasks);
  });

  it('move switches the jar', () => {
    const r = notDone(tasks, 's', { kind: 'move', jar: 'complex' });
    expect(r[0]?.jar).toBe('complex');
    expect(r[1]).toBe(weekly);
  });

  it('pending keeps the original jar', () => {
    const r = notDone(tasks, 'w', { kind: 'pending' });
    expect(r[1]).toEqual({ ...weekly, status: 'pending' });
  });

  it('returning a resumed pending task clears the pending mark', () => {
    const r = notDone([{ ...simple, status: 'pending' }], 's', {
      kind: 'return',
    });
    expect(r[0]?.status).toBeUndefined();
  });
});
