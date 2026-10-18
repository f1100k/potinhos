import { describe, expect, it } from 'vitest';
import {
  type AppAction,
  appReducer,
  createInitialData,
  currentTask,
} from './store';
import type { AppData } from './types';

const now = new Date(2026, 9, 14, 10);
const run = (data: AppData, ...actions: AppAction[]) =>
  actions.reduce(appReducer, data);

const base = () =>
  run(
    createInitialData(now),
    { type: 'addTask', id: 's', text: '  Lavar a louça ', jar: 'simple' },
    { type: 'addTask', id: 'w', text: 'Caminhar', jar: 'weekly', freq: 3 },
  );

describe('createInitialData', () => {
  it('starts empty, with sounds on and the current week', () => {
    const d = createInitialData(now);
    expect(d.tasks).toEqual([]);
    expect(d.done).toEqual([]);
    expect(d.settings.sounds).toBe(true);
    expect(d.meta).toMatchObject({ visited: false, weekStart: '2026-10-12' });
  });
});

describe('appReducer', () => {
  it('adds tasks with trimmed text and ignores empty text', () => {
    const d = run(base(), {
      type: 'addTask',
      id: 'x',
      text: '   ',
      jar: 'simple',
    });
    expect(d.tasks).toEqual([
      { id: 's', text: 'Lavar a louça', jar: 'simple' },
      {
        id: 'w',
        text: 'Caminhar',
        jar: 'weekly',
        freq: 3,
        doneWeek: 0,
        extra: 0,
      },
    ]);
  });

  it('clamps the frequency between 1 and 7', () => {
    const d = run(base(), { type: 'setFreq', id: 'w', freq: 12 });
    expect(d.tasks[1]?.freq).toBe(7);
    expect(run(d, { type: 'setFreq', id: 'w', freq: 0 }).tasks[1]?.freq).toBe(
      1,
    );
  });

  it('pauses and resumes', () => {
    const d = run(base(), { type: 'togglePause', id: 'w' });
    expect(d.tasks[1]?.paused).toBe(true);
    expect(
      run(d, { type: 'togglePause', id: 'w' }).tasks[1],
    ).not.toHaveProperty('paused');
  });

  it('draws, completes and clears the current task', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 's', date: '2026-10-14' },
      { type: 'complete', achievementId: 'k', date: '2026-10-14' },
    );
    expect(d.current).toBeNull();
    expect(d.tasks.map((t) => t.id)).toEqual(['w']);
    expect(d.done[0]).toMatchObject({ id: 'k', text: 'Lavar a louça' });
  });

  it('not done can mark it as pending', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 's', date: '2026-10-14' },
      { type: 'notDone', choice: { kind: 'pending' } },
    );
    expect(d.tasks[0]?.status).toBe('pending');
    expect(d.current).toBeNull();
  });

  it('deletes and undoes at the same position', () => {
    const d0 = base();
    const task = d0.tasks[0];
    if (!task) throw new Error('no task');
    const d1 = run(d0, { type: 'deleteTask', id: 's' });
    expect(d1.tasks.map((t) => t.id)).toEqual(['w']);
    const d2 = run(d1, { type: 'restoreTask', task, index: 0 });
    expect(d2.tasks.map((t) => t.id)).toEqual(['s', 'w']);
  });

  it('closes the week and advances the meta', () => {
    const d = run(base(), {
      type: 'closeWeek',
      decisions: { w: 'pending' },
      now: new Date(2026, 9, 19, 9),
      ids: ['copy'],
    });
    expect(d.meta).toMatchObject({
      weekStart: '2026-10-19',
      lastWeekClosed: '2026-10-12',
    });
    expect(d.tasks.at(-1)).toMatchObject({ id: 'copy', status: 'pending' });
  });

  it('reset goes back to the initial state', () => {
    const d = run(base(), { type: 'visit' }, { type: 'reset', now });
    expect(d).toEqual(createInitialData(now));
  });
});

describe('currentTask', () => {
  it('only holds on the day of the draw', () => {
    const d = run(base(), { type: 'draw', taskId: 's', date: '2026-10-14' });
    expect(currentTask(d, '2026-10-14')?.id).toBe('s');
    expect(currentTask(d, '2026-10-15')).toBeNull();
  });
});
