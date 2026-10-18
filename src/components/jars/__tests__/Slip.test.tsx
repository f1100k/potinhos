import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Slip } from '../Slip';

describe('Slip', () => {
  it('folded is decorative and has a crease', () => {
    const { container } = render(<Slip variant="folded" />);
    const slip = container.firstElementChild;
    expect(slip).toHaveAttribute('aria-hidden', 'true');
    expect(slip?.firstElementChild).toHaveClass('bg-border-soft');
  });

  it('unfolded shows the task text', () => {
    render(<Slip variant="unfolded" text="Lavar a louça" />);
    expect(screen.getByText('Lavar a louça')).toBeVisible();
  });

  it('card shows the text and the jar chip', () => {
    render(<Slip variant="card" text="Lavar a louça" jar="weekly" />);
    expect(screen.getByText('Lavar a louça')).toBeVisible();
    expect(screen.getByText('Semanal')).toBeVisible();
  });

  it('accepts animation classes from the screen', () => {
    const { container } = render(
      <Slip variant="folded" className="animate-fade-in" />,
    );
    expect(container.firstElementChild).toHaveClass('animate-fade-in');
  });
});
