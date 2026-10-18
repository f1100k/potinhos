import { createMemoryHistory } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { App } from '../app/App';
import { useAppData } from '../app/AppStore';
import { createAppRouter } from '../app/router';
import { loadData } from '../domain/persistence/storage';

export async function renderApp(path = '/') {
  useAppData.setState(loadData(localStorage, new Date()), true);
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
  );
  render(<App router={router} />);
  await screen.findByRole('heading', { level: 1 });
  return router;
}
