import { createMemoryHistory } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { App } from '../app/App';
import { createAppRouter } from '../app/router';
import { loadAppData, useAppData } from '../stores/appData';
import { resetSession } from '../stores/session';

export async function renderApp(path = '/') {
  resetSession();
  useAppData.setState(loadAppData(localStorage), true);
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
  );
  render(<App router={router} />);
  await screen.findByRole('heading', { level: 1 });
  return router;
}
