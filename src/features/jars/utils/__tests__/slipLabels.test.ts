import { describe, expect, it } from 'vitest';
import { savedSlipsLabel, slipCountLabel } from '../slipLabels';

describe('slipCountLabel', () => {
  it.each([
    [0, 'vazio'],
    [1, '1 papelzinho'],
    [5, '5 papeizinhos'],
  ])('%i → %s', (count, label) => {
    expect(slipCountLabel(count)).toBe(label);
  });
});

describe('savedSlipsLabel', () => {
  it.each([
    [0, 'ainda vazio'],
    [1, '1 papelzinho guardado'],
    [12, '12 papeizinhos guardados'],
  ])('%i → %s', (count, label) => {
    expect(savedSlipsLabel(count)).toBe(label);
  });
});
