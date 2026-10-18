import { describe, expect, it } from 'vitest';
import { addDays, fromISODate, toISODate } from './dates';

describe('dates', () => {
  it('formats without going through UTC', () => {
    expect(toISODate(new Date(2026, 9, 17, 23, 59))).toBe('2026-10-17');
  });

  it('parses and adds days', () => {
    expect(toISODate(fromISODate('2026-10-17'))).toBe('2026-10-17');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});
