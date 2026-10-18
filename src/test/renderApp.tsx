import { createMemoryHistory } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { App } from '../app/App';
import { createAppRouter } from '../app/router';

/** Monta o app numa URL, com histórico em memória, e espera a tela abrir. */
export async function renderApp(path = '/') {
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
  );
  render(<App router={router} />);
  await screen.findByRole('heading', { level: 1 });
  return router;
}
