import { createMemoryHistory } from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { App } from '../app/App';
import { resetAppOpening } from '../app/appOpening';
import { createAppRouter } from '../app/router';
import { loadAppData, useAppData } from '../app/store';
import { resetWeekendAsked } from '../app/weekTurn';

export async function renderApp(path = '/') {
  resetAppOpening();
  resetWeekendAsked();
  useAppData.setState(loadAppData(localStorage), true);
  const router = createAppRouter(
    createMemoryHistory({ initialEntries: [path] }),
  );
  render(<App router={router} />);
  await screen.findByRole('heading', { level: 1 });
  return router;
}
