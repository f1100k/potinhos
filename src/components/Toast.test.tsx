import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOAST_MS, Toaster, toast } from './Toast';

async function renderToaster() {
  const router = createRouter({
    routeTree: createRootRoute({ component: Toaster }),
    history: createMemoryHistory(),
  });
  render(<RouterProvider router={router} />);
  await screen.findByRole('region', { name: /Avisos/ });
}

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('aparece numa região aria-live e some depois de ~2,6s', async () => {
    await renderToaster();
    act(() => toast('Guardado. Sem pressa.'));
    const regiao = screen.getByRole('region', { name: /Avisos/ });
    expect(regiao).toHaveAttribute('aria-live', 'polite');
    expect(await screen.findByText('Guardado. Sem pressa.')).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(TOAST_MS + 1000));
    expect(screen.queryByText('Guardado. Sem pressa.')).toBeNull();
  });

  it('uma mensagem nova substitui a anterior', async () => {
    await renderToaster();
    act(() => toast('Primeira'));
    act(() => toast('Segunda'));
    expect(await screen.findByText('Segunda')).toBeVisible();
    await waitFor(() => expect(screen.queryByText('Primeira')).toBeNull());
  });

  it('a ação vira um botão que roda e fecha o toast', async () => {
    await renderToaster();
    const desfazer = vi.fn();
    act(() =>
      toast('Papelzinho excluído.', { label: 'Desfazer', onClick: desfazer }),
    );
    const botao = await screen.findByRole('button', { name: 'Desfazer' });
    act(() => botao.click());
    expect(desfazer).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByText('Papelzinho excluído.')).toBeNull(),
    );
  });
});
