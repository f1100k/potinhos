import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';
import { unlockFlow } from './flow';

describe('router', () => {
  it('an unknown URL goes back to the landing page', async () => {
    const router = await renderApp('/does-not-exist');
    expect(router.state.location.pathname).toBe('/');
  });

  it('an invalid param falls back to the default', async () => {
    const router = await renderApp('/achievements?tab=xyz');
    expect(router.state.location.search).toEqual({ tab: 'week' });
  });

  it('opening a flow screen directly by URL leads to the jars', async () => {
    const router = await renderApp('/jars/draw?jar=simple');
    expect(router.state.location.pathname).toBe('/jars');
  });

  it('the flow opens through an action inside the app', async () => {
    const router = await renderApp('/jars');
    await act(async () => {
      unlockFlow();
      await router.navigate({
        to: '/jars/empty',
        search: { jar: 'weekly' },
      });
    });
    expect(router.state.location.pathname).toBe('/jars/empty');
    expect(router.state.location.search).toEqual({ jar: 'weekly' });
    expect(
      screen.getByRole('heading', {
        name: 'Esse pote está vazio por enquanto.',
      }),
    ).toBeInTheDocument();
  });

  it('going back to the flow with the browser leads to the jars', async () => {
    const router = await renderApp('/jars');
    await act(async () => {
      unlockFlow();
      await router.navigate({ to: '/jars/task' });
    });
    await act(() => router.navigate({ to: '/pending' }));
    await act(async () => {
      router.history.back();
      await router.load();
    });
    expect(router.state.location.pathname).toBe('/jars');
  });
});
