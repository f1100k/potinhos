import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PIX_CODE } from '../../app/support';
import { TODAY } from '../../test/flow';
import { renderApp } from '../../test/renderApp';
import { seedData } from '../../test/seedData';

describe('Coffee', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
    seedData(TODAY);
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the Pix QR code and key, with no suggested amount', async () => {
    await renderApp('/coffee?from=app');
    expect(screen.getByRole('img', { name: 'QR code do Pix' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: '444.780.078-02 · copiar' }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Sem valor sugerido, sem meta. Qualquer coisa é um presente.',
      ),
    ).toBeVisible();
    expect(screen.queryByText(/Buy Me a Coffee/)).toBeNull();
    expect(screen.queryByRole('link', { name: '‹ Voltar' })).toBeNull();
  });

  it('copies the key and thanks', async () => {
    await renderApp('/coffee?from=app');
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue();
    await user.click(
      screen.getByRole('button', { name: '444.780.078-02 · copiar' }),
    );
    expect(writeText).toHaveBeenCalledWith('44478007802');
    expect(
      await screen.findByText('Chave Pix copiada. Obrigada!'),
    ).toBeVisible();
  });

  it('copies the Pix copia e cola code', async () => {
    await renderApp('/coffee?from=app');
    const user = userEvent.setup();
    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue();
    await user.click(
      screen.getByRole('button', { name: 'Copiar Pix copia e cola' }),
    );
    expect(writeText).toHaveBeenCalledWith(PIX_CODE);
  });

  it('shows the key when copying is not allowed', async () => {
    await renderApp('/coffee?from=app');
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(
      new Error('denied'),
    );
    await user.click(
      screen.getByRole('button', { name: '444.780.078-02 · copiar' }),
    );
    expect(
      await screen.findByText('Não consegui copiar. A chave é 444.780.078-02.'),
    ).toBeVisible();
  });

  it('opened from the landing page, offers a way back', async () => {
    const router = await renderApp('/coffee?from=landing');
    await userEvent.click(screen.getByRole('link', { name: '‹ Voltar' }));
    expect(router.state.location.pathname).toBe('/');
  });
});
