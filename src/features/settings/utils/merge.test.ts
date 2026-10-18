import { describe, expect, it } from 'vitest';
import { createInitialData } from '../../../stores/appReducer';
import type { AppData } from '../../../types/model';
import { mergeData } from './merge';

const NOW = new Date(2026, 9, 14, 10);

function data(overrides: Partial<AppData>): AppData {
  return { ...createInitialData(NOW), ...overrides };
}

describe('mergeData', () => {
  it('adds the slips and achievements that are not here yet', () => {
    const current = data({
      tasks: [{ id: 'a', text: 'Lavar a louça', jar: 'simple' }],
      achievements: [
        { id: 'x', text: 'Correr', jar: 'weekly', date: '2026-10-10' },
      ],
    });
    const imported = data({
      tasks: [
        { id: 'a', text: 'Lavar a louça (outro aparelho)', jar: 'simple' },
        { id: 'b', text: 'Regar as plantas', jar: 'simple' },
      ],
      achievements: [
        { id: 'x', text: 'Correr', jar: 'weekly', date: '2026-10-10' },
        { id: 'y', text: 'Ler', jar: 'weekly', date: '2026-10-12' },
        { id: 'z', text: 'Nadar', jar: 'weekly', date: '2026-10-01' },
      ],
    });
    const merged = mergeData(current, imported);
    expect(merged.tasks.map((t) => t.text)).toEqual([
      'Lavar a louça',
      'Regar as plantas',
    ]);
    expect(merged.achievements.map((a) => a.id)).toEqual(['y', 'x', 'z']);
  });

  it('keeps the settings, the week and the draw of this device', () => {
    const current = data({
      settings: { sounds: false },
      drawn: null,
      tasks: [],
    });
    const imported = data({
      settings: { sounds: true },
      meta: { visited: true, weekStart: '2026-09-28', lastWeekClosed: null },
      tasks: [{ id: 'b', text: 'Regar as plantas', jar: 'simple' }],
      drawn: { taskId: 'b', date: '2026-10-14' },
    });
    const merged = mergeData(current, imported);
    expect(merged.settings).toBe(current.settings);
    expect(merged.meta).toBe(current.meta);
    expect(merged.drawn).toBeNull();
  });

  it('returns the same object when there is nothing new', () => {
    const current = data({
      tasks: [{ id: 'a', text: 'Lavar a louça', jar: 'simple' }],
    });
    expect(mergeData(current, current)).toBe(current);
  });
});
