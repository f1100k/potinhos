import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { JarChip } from '../JarChip';

describe('JarChip', () => {
  it.each([
    ['simple', 'Simples', 'bg-chip-simple-bg'],
    ['complex', 'Complexas', 'bg-chip-complex-bg'],
    ['weekly', 'Semanal', 'bg-chip-weekly-bg'],
  ] as const)('shows the %s jar name with its colors', (jar, name, color) => {
    render(<JarChip jar={jar} />);
    expect(screen.getByText(name)).toHaveClass(color);
  });
});
