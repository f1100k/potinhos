import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialData } from '../../../../stores/appReducer';
import { resetSession } from '../../../../stores/session';
import type { AppData, Task } from '../../../../types/model';
import { weekTurn } from '../weekTurn';

const LAST_MONDAY = new Date(2026, 9, 5, 10);
const MONDAY = new Date(2026, 9, 12, 10);

const RUNNING: Task = { id: 'c', text: 'Correr', jar: 'weekly', freq: 2 };

function dataFrom(weekOf: Date, tasks: Task[]): AppData {
  return { ...createInitialData(weekOf), tasks };
}

describe('weekTurn', () => {
  beforeEach(resetSession);

  it('does nothing while the week is open', () => {
    expect(weekTurn(dataFrom(MONDAY, [RUNNING]), MONDAY)).toBe('none');
  });

  it('closes by itself when nothing was left in the weekly jar', () => {
    const done = { ...RUNNING, doneWeek: 2 };
    expect(weekTurn(dataFrom(LAST_MONDAY, [done]), MONDAY)).toBe('autoClose');
  });

  it('asks about the leftovers once per session', () => {
    const data = dataFrom(LAST_MONDAY, [RUNNING]);
    expect(weekTurn(data, MONDAY)).toBe('askWeekend');
    expect(weekTurn(data, MONDAY)).toBe('none');
  });
});
