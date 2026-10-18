import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { act, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOAST_MS, toast } from '../components/Toast';
import { Toaster } from './Toaster';

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

  it('shows up in an aria-live region and goes away after ~2.6s', async () => {
    await renderToaster();
    act(() => toast('Guardado. Sem pressa.'));
    const region = screen.getByRole('region', { name: /Avisos/ });
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(await screen.findByText('Guardado. Sem pressa.')).toBeVisible();
    await act(() => vi.advanceTimersByTimeAsync(TOAST_MS + 1000));
    expect(screen.queryByText('Guardado. Sem pressa.')).toBeNull();
  });

  it('a new message replaces the previous one', async () => {
    await renderToaster();
    act(() => toast('Primeira'));
    act(() => toast('Segunda'));
    expect(await screen.findByText('Segunda')).toBeVisible();
    await waitFor(() => expect(screen.queryByText('Primeira')).toBeNull());
  });

  it('the action becomes a button that runs and closes the toast', async () => {
    await renderToaster();
    const undo = vi.fn();
    act(() =>
      toast('Papelzinho excluído.', { label: 'Desfazer', onClick: undo }),
    );
    const button = await screen.findByRole('button', { name: 'Desfazer' });
    act(() => button.click());
    expect(undo).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByText('Papelzinho excluído.')).toBeNull(),
    );
  });
});
