import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../../testing/renderApp';

describe('App', () => {
  it('opens on the landing page', async () => {
    await renderApp();
    expect(
      screen.getByRole('heading', { name: 'Como funciona' }),
    ).toBeInTheDocument();
  });

  it.each([
    ['/jars', 'Como está sua energia hoje?'],
    ['/new-task', 'O que você quer guardar?'],
    ['/edit', 'Seus potes'],
    ['/pending', 'Pendentes'],
    ['/achievements', 'Pote de conquistas'],
    ['/settings', 'Configurações'],
    ['/coffee', 'Me paga um café?'],
  ])('opens %s', async (path, heading) => {
    await renderApp(path);
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument();
  });
});
