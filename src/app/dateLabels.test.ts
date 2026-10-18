import { describe, expect, it } from 'vitest';
import { longDateLabel } from './dateLabels';

describe('longDateLabel', () => {
  it('spells out the date in pt-BR, starting with a capital letter', () => {
    expect(longDateLabel(new Date(2026, 9, 17))).toBe('Sábado, 17 de outubro');
  });
});
