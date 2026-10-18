import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Button, buttonClass } from './Button';

describe('Button', () => {
  it('is primary by default and does not submit forms', () => {
    render(<Button>Concluí</Button>);
    const button = screen.getByRole('button', { name: 'Concluí' });
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('bg-accent');
  });

  it.each([
    ['weekly', 'bg-weekly-fg'],
    ['secondary', 'border-border-soft'],
    ['link', 'text-link'],
    ['quiet', 'text-text-secondary'],
    ['achievements', 'text-achievements-fg'],
  ] as const)('uses the %s look', (variant, expectedClass) => {
    render(<Button variant={variant}>Voltar aos potes</Button>);
    expect(screen.getByRole('button')).toHaveClass(expectedClass);
  });

  it('keeps extra classes and handles clicks', async () => {
    const onClick = vi.fn();
    render(
      <Button className="w-full" onClick={onClick}>
        Colocar no pote
      </Button>,
    );
    const button = screen.getByRole('button');
    expect(button).toHaveClass('w-full', 'bg-accent');
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('exposes the same classes for router links', () => {
    expect(buttonClass('secondary')).toContain('rounded-pill');
  });
});
