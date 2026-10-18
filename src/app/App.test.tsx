import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

describe('App', () => {
  it('abre na landing', async () => {
    await renderApp();
    expect(
      screen.getByRole('heading', { name: 'Como funciona' }),
    ).toBeInTheDocument();
  });

  it('abre na URL pedida', async () => {
    await renderApp('/configuracoes');
    expect(
      screen.getByRole('heading', { name: 'Configurações' }),
    ).toBeInTheDocument();
  });
});
