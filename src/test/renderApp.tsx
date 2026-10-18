import { createMemoryHistory } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { App } from '../app/App';
import { useAppData } from '../app/AppStore';
import { createAppRouter } from '../app/router';
import { loadData } from '../domain/persistence';

/**
 * Monta o app numa URL, com histórico em memória, e espera a tela abrir.
 * Os dados são relidos do `localStorage`, como numa abertura de verdade.
 */
export async function renderApp(path = '/') {
  useAppData.setState(loadData(localStorage, new Date()), true);
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
  );
  render(<App router={router} />);
  await screen.findByRole('heading', { level: 1 });
  return router;
}
