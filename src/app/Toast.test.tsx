import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NavProvider } from './Nav';
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
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('aparece numa região aria-live e some depois de ~2,6s', () => {
    render(
      <NavProvider initial={{ screen: 'home' }}>
        <ToastProvider>
          <Botao />
        </ToastProvider>
      </NavProvider>,
    );
    act(() => screen.getByRole('button').click());
    expect(screen.getByRole('status')).toHaveTextContent(
      'Guardado. Sem pressa.',
    );
    act(() => vi.advanceTimersByTime(TOAST_MS));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
