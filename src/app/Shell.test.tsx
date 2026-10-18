import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';
import { unlockFlow } from './flow';

function texts(links: HTMLElement[]) {
  return links.map((l) => l.textContent);
}

function menu() {
  // The sidebar is hidden on mobile; here we only check its content.
  return screen.getByRole('navigation', { name: 'Menu', hidden: true });
}

describe('Shell', () => {
  it('the bottom bar has 4 items', async () => {
    await renderApp('/jars');
    const bar = screen.getByRole('navigation', { name: 'Navegação' });
    expect(texts(within(bar).getAllByRole('link'))).toEqual([
      'Meus potes',
      'Nova tarefa',
      'Pendentes',
      'Configurações',
    ]);
  });

  it('the sidebar has 6 items and the coffee link', async () => {
    await renderApp('/jars');
    expect(
      texts(within(menu()).getAllByRole('link', { hidden: true })),
    ).toEqual([
      'Meus potes',
      'Nova tarefa',
      'Ver e editar potes',
      'Tarefas pendentes',
      'Pote de conquistas',
      'Configurações',
      'Me paga um café?',
    ]);
  });

  it('marks the active item and navigates', async () => {
    const router = await renderApp('/jars');
    const bar = screen.getByRole('navigation', { name: 'Navegação' });
    await userEvent.click(within(bar).getByRole('link', { name: 'Pendentes' }));
    expect(router.state.location.pathname).toBe('/pending');
    expect(
      within(screen.getByRole('navigation', { name: 'Navegação' })).getByRole(
        'link',
        { name: 'Pendentes' },
      ),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('Pote de conquistas stays active on any tab', async () => {
    await renderApp('/achievements?tab=month');
    expect(
      within(menu()).getByRole('link', {
        name: 'Pote de conquistas',
        hidden: true,
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('in the flow, hides the bottom bar and keeps Meus potes active', async () => {
    const router = await renderApp('/jars');
    await act(async () => {
      unlockFlow();
      await router.navigate({ to: '/jars/task' });
    });
    expect(
      screen.queryByRole('navigation', { name: 'Navegação' }),
    ).not.toBeInTheDocument();
    expect(
      within(menu()).getByRole('link', { name: 'Meus potes', hidden: true }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
