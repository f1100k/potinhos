import { describe, expect, it } from 'vitest';
import type { Meta } from './types';
import {
  closeWeekMeta,
  isWeekEnding,
  isWeekOverdue,
  mondayOf,
  sundayOf,
} from './week';

const meta = (weekStart: string): Meta => ({
  schemaVersion: 2,
  visited: true,
  weekStart,
  lastWeekClosed: null,
});

// 2026-10-12 is a Monday; 2026-10-18 is a Sunday.
const at = (day: number, h = 12, m = 0) => new Date(2026, 9, day, h, m);

describe('mondayOf', () => {
  it('Monday is the Monday itself', () => {
    expect(mondayOf(at(12, 0, 0))).toBe('2026-10-12');
  });

  it('Sunday 23:59 is still the same week', () => {
    expect(mondayOf(at(18, 23, 59))).toBe('2026-10-12');
  });

  it('Monday 00:00 is already the next week', () => {
    expect(mondayOf(at(19, 0, 0))).toBe('2026-10-19');
  });

  it('crosses the month', () => {
    expect(mondayOf(new Date(2026, 10, 1))).toBe('2026-10-26');
  });

  it('sundayOf ends the week', () => {
    expect(sundayOf('2026-10-12')).toBe('2026-10-18');
  });
});

describe('isWeekOverdue', () => {
  it('is not overdue during the week', () => {
    expect(isWeekOverdue(meta('2026-10-12'), at(18, 23, 59))).toBe(false);
  });

  it('is overdue after Sunday 23:59', () => {
    expect(isWeekOverdue(meta('2026-10-12'), at(19, 0, 0))).toBe(true);
  });

  it('is still a single closing after several weeks', () => {
    const m = meta('2026-09-28');
    const now = at(19);
    expect(isWeekOverdue(m, now)).toBe(true);
    const after = closeWeekMeta(m, now);
    expect(after.weekStart).toBe('2026-10-19');
    expect(isWeekOverdue(after, now)).toBe(false);
  });
});

describe('isWeekEnding', () => {
  it('is false on Friday before 6 pm', () => {
    expect(isWeekEnding(meta('2026-10-12'), at(16, 17, 59))).toBe(false);
  });

  it('is true on Friday evening, Saturday and Sunday', () => {
    expect(isWeekEnding(meta('2026-10-12'), at(16, 18))).toBe(true);
    expect(isWeekEnding(meta('2026-10-12'), at(17))).toBe(true);
    expect(isWeekEnding(meta('2026-10-12'), at(18, 23))).toBe(true);
  });

  it('is false after closing the week early', () => {
    const closed = closeWeekMeta(meta('2026-10-12'), at(17));
    expect(closed.weekStart).toBe('2026-10-19');
    expect(closed.lastWeekClosed).toBe('2026-10-12');
    expect(isWeekEnding(closed, at(18))).toBe(false);
    expect(isWeekOverdue(closed, at(19, 9))).toBe(false);
  });
});
