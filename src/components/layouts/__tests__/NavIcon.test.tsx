import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { NavIcon } from '../NavIcon';

describe('NavIcon', () => {
  it.each(['jars', 'newTask', 'pending', 'settings'] as const)(
    'draws the %s icon as decoration in the text color',
    (name) => {
      const { container } = render(<NavIcon name={name} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('stroke', 'currentColor');
      expect(svg?.children.length).toBeGreaterThan(0);
    },
  );
});
