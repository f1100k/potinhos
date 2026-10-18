import { beforeEach, describe, expect, it } from 'vitest';
import { consumeAppOpening, resetAppOpening } from './appOpening';

describe('consumeAppOpening', () => {
  beforeEach(resetAppOpening);

  it('is true only for the first navigation', () => {
    expect(consumeAppOpening()).toBe(true);
    expect(consumeAppOpening()).toBe(false);
    expect(consumeAppOpening()).toBe(false);
  });
});
