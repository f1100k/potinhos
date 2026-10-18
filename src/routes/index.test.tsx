import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../app/store';
import { createInitialData } from '../domain/reducer';
import { TODAY } from '../test/flow';
import { renderApp } from '../test/renderApp';
import { seedData } from '../test/seedData';

const VISITED = { ...createInitialData(TODAY).meta, visited: true };

describe('Landing', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('explains how it works, outside the app shell', async () => {
    seedData(TODAY);
    await renderApp('/');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Um jeito gentil de fazer as coisas, um papelzinho de cada vez.',
      }),
    ).toBeVisible();
    expect(screen.getByText('Gratuito. Sem anúncios.')).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(
      screen.getByRole('heading', { name: 'Nada sai do seu aparelho.' }),
    ).toBeVisible();
    expect(screen.queryByRole('navigation')).toBeNull();
    expect(
      screen.getByRole('link', { name: 'Me paga um café?' }),
    ).toHaveAttribute('href', '/coffee?from=landing');
  });

  it('the first Começar marks the visit and tells where the data stays', async () => {
    seedData(TODAY);
    const router = await renderApp('/');
    const [headerCta, finalCta] = screen.getAllByRole('button', {
      name: 'Começar',
    });
    expect(finalCta).toBeVisible();
    if (headerCta) await userEvent.click(headerCta);

    expect(router.state.location.pathname).toBe('/jars');
    expect(useAppData.getState().meta.visited).toBe(true);
    expect(
      await screen.findByText('Seus papeizinhos ficam só neste aparelho.'),
    ).toBeVisible();
  });

  it('after the first visit, the app opens straight on the jars', async () => {
    seedData(TODAY, { meta: VISITED });
    const router = await renderApp('/');
    expect(router.state.location.pathname).toBe('/jars');
  });

  it('opened from inside the app, it stays and offers to open the jars', async () => {
    seedData(TODAY, { meta: VISITED });
    const router = await renderApp('/settings');
    await userEvent.click(
      screen.getByRole('link', { name: /Sobre o Potinhos/ }),
    );
    expect(router.state.location.pathname).toBe('/');
    const [cta] = screen.getAllByRole('button', { name: 'Abrir meus potes' });
    if (cta) await userEvent.click(cta);
    expect(router.state.location.pathname).toBe('/jars');
  });
});
