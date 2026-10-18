import { describe, expect, it } from 'vitest';
import { appReducer, createInitialData, drawnToday } from './reducer';
import type { AppAction, AppData } from './types';

const now = new Date(2026, 9, 14, 10);
const tomorrow = new Date(2026, 9, 15, 10);
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
    expect(d.achievements).toEqual([]);
    expect(d.settings.sounds).toBe(true);
    expect(d.meta).toEqual({
      visited: false,
      weekStart: '2026-10-12',
      lastWeekClosed: null,
    });
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
        carriedOver: 0,
      },
    ]);
  });

  it('a new weekly task defaults to twice a week', () => {
    const d = run(createInitialData(now), {
      type: 'addTask',
      id: 'w',
      text: 'Ler',
      jar: 'weekly',
    });
    expect(d.tasks[0]?.freq).toBe(2);
  });

  it('edits the text, trimmed, and ignores empty text', () => {
    const d = run(base(), { type: 'editTask', id: 's', text: ' Secar ' });
    expect(d.tasks[0]?.text).toBe('Secar');
    expect(run(d, { type: 'editTask', id: 's', text: '  ' })).toBe(d);
  });

  it('moves a task to another jar', () => {
    const d = run(base(), { type: 'moveTask', id: 's', jar: 'weekly' });
    expect(d.tasks[0]).toMatchObject({ jar: 'weekly', freq: 1 });
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

  it('frequency and pause only apply to active weekly tasks', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 'w', now },
      { type: 'notDone', choice: { kind: 'pending' }, now },
    );
    expect(
      run(
        d,
        { type: 'setFreq', id: 's', freq: 3 },
        { type: 'togglePause', id: 's' },
        { type: 'setFreq', id: 'w', freq: 5 },
        { type: 'togglePause', id: 'w' },
      ),
    ).toBe(d);
  });

  it('draws, completes and clears the current task', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 's', now },
      { type: 'complete', achievementId: 'k', now },
    );
    expect(d.drawn).toBeNull();
    expect(d.tasks.map((t) => t.id)).toEqual(['w']);
    expect(d.achievements[0]).toMatchObject({
      id: 'k',
      text: 'Lavar a louça',
      date: '2026-10-14',
    });
  });

  it('does not draw a task that does not exist', () => {
    const d = base();
    expect(run(d, { type: 'draw', taskId: 'x', now })).toBe(d);
  });

  it('not done can mark it as pending', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 's', now },
      { type: 'notDone', choice: { kind: 'pending' }, now },
    );
    expect(d.tasks[0]?.status).toBe('pending');
    expect(d.drawn).toBeNull();
  });

  it('complete and not done need a task drawn today', () => {
    const d = base();
    expect(run(d, { type: 'complete', achievementId: 'k', now })).toBe(d);
    expect(run(d, { type: 'notDone', choice: { kind: 'return' }, now })).toBe(
      d,
    );

    const drawn = run(d, { type: 'draw', taskId: 's', now });
    expect(
      run(drawn, { type: 'complete', achievementId: 'k', now: tomorrow }),
    ).toBe(drawn);
    expect(
      run(drawn, {
        type: 'notDone',
        choice: { kind: 'return' },
        now: tomorrow,
      }),
    ).toBe(drawn);
  });

  it('puts a pending task back in a jar', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 's', now },
      { type: 'notDone', choice: { kind: 'pending' }, now },
      { type: 'pendingToJar', id: 's', jar: 'complex' },
    );
    expect(d.tasks[0]).toEqual({
      id: 's',
      text: 'Lavar a louça',
      jar: 'complex',
    });
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

  it('deleting the drawn task clears it', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 's', now },
      { type: 'deleteTask', id: 's' },
    );
    expect(d.drawn).toBeNull();
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

  it('turns sounds on and off', () => {
    const d = run(base(), { type: 'setSounds', on: false });
    expect(d.settings.sounds).toBe(false);
  });

  it('returns the same data when nothing changes', () => {
    const d = base();
    const same: AppAction[] = [
      { type: 'editTask', id: 's', text: 'Lavar a louça' },
      { type: 'editTask', id: 'x', text: 'Outra' },
      { type: 'moveTask', id: 's', jar: 'simple' },
      { type: 'deleteTask', id: 'x' },
      { type: 'setFreq', id: 'w', freq: 3 },
      { type: 'setSounds', on: true },
      { type: 'clearDrawn' },
    ];
    for (const action of same) expect(appReducer(d, action)).toBe(d);
  });

  it('reset goes back to the initial state', () => {
    const d = run(base(), { type: 'visit' }, { type: 'reset', now });
    expect(d).toEqual(createInitialData(now));
  });
});

describe('drawnToday', () => {
  it('only holds on the day of the draw', () => {
    const d = run(base(), { type: 'draw', taskId: 's', now });
    expect(drawnToday(d, now)?.id).toBe('s');
    expect(drawnToday(d, tomorrow)).toBeNull();
  });
});
