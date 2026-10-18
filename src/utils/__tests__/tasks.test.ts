import { describe, expect, it } from 'vitest';
import type { Task } from '../../types/model';
import {
  complete,
  moveToJar,
  newTask,
  notDone,
  remaining,
  returnToJar,
} from '../tasks';

const simple: Task = { id: 's', text: 'Lavar a louça', jar: 'simple' };
const weekly: Task = {
  id: 'w',
  text: 'Caminhar',
  jar: 'weekly',
  freq: 3,
  doneWeek: 2,
  carriedOver: 1,
};

describe('newTask', () => {
  it('only weekly tasks get the weekly fields', () => {
    expect(newTask('s', 'x', 'simple')).toEqual({
      id: 's',
      text: 'x',
      jar: 'simple',
    });
    expect(newTask('w', 'x', 'weekly', 12)).toEqual({
      id: 'w',
      text: 'x',
      jar: 'weekly',
      freq: 7,
      doneWeek: 0,
      carriedOver: 0,
    });
  });
});

describe('remaining', () => {
  it('is freq + carriedOver − doneWeek', () => {
    expect(remaining(weekly)).toBe(2);
  });

  it('is never negative', () => {
    expect(remaining({ ...weekly, freq: 1, carriedOver: 0, doneWeek: 3 })).toBe(
      0,
    );
  });

  it('is zero when the task is paused', () => {
    expect(remaining({ ...weekly, paused: true })).toBe(0);
  });

  it('treats missing fields as zero', () => {
    expect(remaining(simple)).toBe(0);
  });
});

describe('complete', () => {
  const tasks: Task[] = [
    simple,
    { id: 'c', text: 'Organizar as finanças', jar: 'complex' },
    weekly,
    { id: 'p', text: 'Ligar para a tia', jar: 'weekly', status: 'pending' },
  ];
  const today = { id: 'k1', date: '2026-10-17' };

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
    const result = complete(tasks, [], 'w', today);
    expect(result.tasks.find((t) => t.id === 'w')?.doneWeek).toBe(3);
  });

  it('removes a pending task even from Weekly', () => {
    const result = complete(tasks, [], 'p', today);
    expect(result.tasks.find((t) => t.id === 'p')).toBeUndefined();
  });

  it("records the achievement with today's date, newest first", () => {
    const before = [
      { id: 'k0', text: 'Antiga', jar: 'simple' as const, date: '2026-10-01' },
    ];
    const result = complete(tasks, before, 'w', today);
    expect(result.achievements).toEqual([
      { id: 'k1', text: 'Caminhar', jar: 'weekly', date: '2026-10-17' },
      before[0],
    ]);
  });

  it('ignores an unknown id', () => {
    const result = complete(tasks, [], 'x', today);
    expect(result.tasks).toEqual(tasks);
    expect(result.achievements).toEqual([]);
  });
});

describe('moveToJar', () => {
  it('starts at once a week when entering Weekly', () => {
    expect(moveToJar(simple, 'weekly')).toEqual({
      id: 's',
      text: 'Lavar a louça',
      jar: 'weekly',
      freq: 1,
      doneWeek: 0,
      carriedOver: 0,
    });
  });

  it('drops the weekly fields when leaving Weekly', () => {
    expect(moveToJar(weekly, 'complex')).toEqual({
      id: 'w',
      text: 'Caminhar',
      jar: 'complex',
    });
  });

  it('resets doneWeek and carriedOver and keeps the status', () => {
    const task = moveToJar({ ...weekly, status: 'pending' }, 'weekly');
    expect(task).toMatchObject({
      doneWeek: 0,
      carriedOver: 0,
      status: 'pending',
    });
  });
});

describe('returnToJar', () => {
  it('clears pending and keeps the jar', () => {
    const task = returnToJar({ ...simple, status: 'pending' }, 'simple');
    expect(task).toEqual(simple);
  });
});

describe('notDone', () => {
  const tasks = [simple, weekly];

  it('return keeps it in the same jar', () => {
    expect(notDone(tasks, 's', { kind: 'return' })).toEqual(tasks);
  });

  it('move switches the jar', () => {
    const result = notDone(tasks, 's', { kind: 'move', jar: 'complex' });
    expect(result[0]?.jar).toBe('complex');
    expect(result[1]).toBe(weekly);
  });

  it('pending keeps the original jar', () => {
    const result = notDone(tasks, 'w', { kind: 'pending' });
    expect(result[1]).toEqual({ ...weekly, status: 'pending' });
  });

  it('returning a resumed pending task clears the pending mark', () => {
    const result = notDone([{ ...simple, status: 'pending' }], 's', {
      kind: 'return',
    });
    expect(result[0]?.status).toBeUndefined();
  });
});
