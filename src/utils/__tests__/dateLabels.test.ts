import { describe, expect, it } from 'vitest';
import { longDateLabel, shortDateLabel } from '../dateLabels';

describe('longDateLabel', () => {
  it('spells out the date in pt-BR, starting with a capital letter', () => {
    expect(longDateLabel(new Date(2026, 9, 17))).toBe('Sábado, 17 de outubro');
  });
});

describe('shortDateLabel', () => {
  it('shows the day and the short month, in local time', () => {
    expect(shortDateLabel('2026-10-03')).toBe('3 de out.');
  });
});
