import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Dialog } from '../Dialog';

describe('Dialog', () => {
  it('opens as a modal named by its title', () => {
    const { rerender } = render(
      <Dialog open={false} title="Apagar tudo mesmo?" onClose={() => {}}>
        <p>Não dá para desfazer.</p>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();

    rerender(
      <Dialog open title="Apagar tudo mesmo?" onClose={() => {}}>
        <p>Não dá para desfazer.</p>
      </Dialog>,
    );
    expect(
      screen.getByRole('dialog', { name: 'Apagar tudo mesmo?' }),
    ).toBeVisible();
    expect(screen.getByText('Não dá para desfazer.')).toBeVisible();
  });

  it('tells when it closes, like with Esc', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <Dialog open title="Apagar tudo mesmo?" onClose={onClose}>
        <p>Não dá para desfazer.</p>
      </Dialog>,
    );
    rerender(
      <Dialog open={false} title="Apagar tudo mesmo?" onClose={onClose}>
        <p>Não dá para desfazer.</p>
      </Dialog>,
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onClose).toHaveBeenCalledOnce();
  });
});
