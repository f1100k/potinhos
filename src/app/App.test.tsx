import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';

describe('App', () => {
  it('opens on the landing page', async () => {
    await renderApp();
    expect(
      screen.getByRole('heading', { name: 'Como funciona' }),
    ).toBeInTheDocument();
  });

  it('opens on the requested URL', async () => {
    await renderApp('/settings');
    expect(
      screen.getByRole('heading', { name: 'Configurações' }),
    ).toBeInTheDocument();
  });
});
