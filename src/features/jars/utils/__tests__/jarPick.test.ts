import { describe, expect, it } from 'vitest';
import { createInitialData } from '../../../../stores/appReducer';
import type { AppData } from '../../../../types/model';
import { pickJar } from '../jarPick';

const NOW = new Date(2026, 9, 14, 10);

function dataWith(overrides: Partial<AppData>): AppData {
  return { ...createInitialData(NOW), ...overrides };
}

describe('pickJar', () => {
  it('draws one of the slips of the chosen jar', () => {
    const data = dataWith({
      tasks: [
        { id: 'a', text: 'Lavar a louça', jar: 'simple' },
        { id: 'b', text: 'Arrumar o armário', jar: 'complex' },
        { id: 'c', text: 'Regar as plantas', jar: 'simple' },
      ],
    });
    expect(pickJar(data, 'simple', NOW, () => 0)).toEqual({
      kind: 'draw',
      taskId: 'a',
    });
    expect(pickJar(data, 'simple', NOW, () => 0.99)).toEqual({
      kind: 'draw',
      taskId: 'c',
    });
  });

  it('an empty jar leads to the empty screen', () => {
    const data = dataWith({
      tasks: [{ id: 'a', text: 'Lavar a louça', jar: 'simple' }],
    });
    expect(pickJar(data, 'complex', NOW)).toEqual({ kind: 'empty' });
  });

  it('a slip drawn today blocks a new draw in any jar', () => {
    const data = dataWith({
      tasks: [
        { id: 'a', text: 'Lavar a louça', jar: 'simple' },
        { id: 'b', text: 'Arrumar o armário', jar: 'complex' },
      ],
      drawn: { taskId: 'a', date: '2026-10-14' },
    });
    expect(pickJar(data, 'complex', NOW)).toEqual({ kind: 'alreadyDrawn' });
  });

  it('a slip drawn on another day no longer blocks', () => {
    const data = dataWith({
      tasks: [{ id: 'a', text: 'Lavar a louça', jar: 'simple' }],
      drawn: { taskId: 'a', date: '2026-10-13' },
    });
    expect(pickJar(data, 'simple', NOW)).toEqual({
      kind: 'draw',
      taskId: 'a',
    });
  });
});
