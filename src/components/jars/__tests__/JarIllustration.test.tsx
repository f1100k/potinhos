import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { JarIllustration } from '../JarIllustration';

function renderJar(props: Parameters<typeof JarIllustration>[0]) {
  const { container } = render(<JarIllustration {...props} />);
  const root = container.firstElementChild as HTMLElement;
  return {
    root,
    lid: root.children[0] as HTMLElement,
    slips: () => root.querySelectorAll('.bg-surface.size-full'),
  };
}

describe('JarIllustration', () => {
  it('is decorative and has the size of the prototype', () => {
    const { root } = renderJar({ kind: 'simple', size: 'sm', slips: 0 });
    expect(root).toHaveAttribute('aria-hidden', 'true');
    expect(root).toHaveStyle({ width: '96px', height: '112px' });
  });

  it('paints the lid with the jar color', () => {
    expect(
      renderJar({ kind: 'complex', size: 'md', slips: 0 }).lid,
    ).toHaveClass('bg-lid-complex');
    expect(
      renderJar({ kind: 'achievements', size: 'xs', slips: 0 }).lid,
    ).toHaveClass('bg-lid-achievements');
  });

  it('shows one slip per task, up to 9', () => {
    expect(
      renderJar({ kind: 'simple', size: 'sm', slips: 4 }).slips(),
    ).toHaveLength(4);
    expect(
      renderJar({ kind: 'simple', size: 'lg', slips: 30 }).slips(),
    ).toHaveLength(9);
  });

  it('shows the "esta semana" tag only when asked', () => {
    renderJar({ kind: 'weekly', size: 'sm', slips: 1 });
    expect(screen.queryByText('esta semana')).toBeNull();
    renderJar({ kind: 'weekly', size: 'sm', slips: 1, weekTag: true });
    expect(screen.getByText('esta semana')).toBeInTheDocument();
  });

  it('animates the glow and the falling slips only when asked', () => {
    const still = renderJar({ kind: 'weekly', size: 'lg', slips: 2 });
    expect(still.root.innerHTML).not.toMatch(/glow|fallIn/);

    const lively = renderJar({
      kind: 'weekly',
      size: 'lg',
      slips: 2,
      glow: true,
      falling: true,
    });
    expect(lively.root.innerHTML).toMatch(/glow 1\.8s/);
    expect(lively.root.innerHTML).toMatch(/fallIn 1\.3s .* 0\.22s/);
  });
});
