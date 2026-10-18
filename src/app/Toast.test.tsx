import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TOAST_MS, ToastProvider, useToast } from './Toast';

function Botao() {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast('Guardado. Sem pressa.')}>
      mostrar
    </button>
  );
}

describe('Toast', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('aparece numa região aria-live e some depois de ~2,6s', async () => {
    const router = createRouter({
      routeTree: createRootRoute({
        component: () => (
          <ToastProvider>
            <Botao />
          </ToastProvider>
        ),
      }),
      history: createMemoryHistory(),
    });
    render(<RouterProvider router={router} />);
    const botao = await screen.findByRole('button');
    act(() => botao.click());
    expect(screen.getByRole('status')).toHaveTextContent(
      'Guardado. Sem pressa.',
    );
    act(() => vi.advanceTimersByTime(TOAST_MS));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
