import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';
import { liberarFluxo } from './fluxo';

function textos(links: HTMLElement[]) {
  return links.map((l) => l.textContent);
}

function menu() {
  // No celular o menu lateral fica oculto; aqui só conferimos o conteúdo.
  return screen.getByRole('navigation', { name: 'Menu', hidden: true });
}

describe('Shell', () => {
  it('a barra inferior tem os 4 itens', async () => {
    await renderApp('/potes');
    const bar = screen.getByRole('navigation', { name: 'Navegação' });
    expect(textos(within(bar).getAllByRole('link'))).toEqual([
      'Meus potes',
      'Nova tarefa',
      'Pendentes',
      'Configurações',
    ]);
  });

  it('o menu lateral tem os 6 itens e o link do café', async () => {
    await renderApp('/potes');
    expect(
      textos(within(menu()).getAllByRole('link', { hidden: true })),
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

  it('marca o item ativo e navega', async () => {
    const router = await renderApp('/potes');
    const bar = screen.getByRole('navigation', { name: 'Navegação' });
    await userEvent.click(within(bar).getByRole('link', { name: 'Pendentes' }));
    expect(router.state.location.pathname).toBe('/pendentes');
    expect(
      within(screen.getByRole('navigation', { name: 'Navegação' })).getByRole(
        'link',
        { name: 'Pendentes' },
      ),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('Pote de conquistas fica ativo em qualquer aba', async () => {
    await renderApp('/conquistas?tab=mes');
    expect(
      within(menu()).getByRole('link', {
        name: 'Pote de conquistas',
        hidden: true,
      }),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('no fluxo esconde a barra inferior e deixa Meus potes ativo', async () => {
    const router = await renderApp('/potes');
    await act(async () => {
      liberarFluxo();
      await router.navigate({ to: '/potes/tarefa' });
    });
    expect(
      screen.queryByRole('navigation', { name: 'Navegação' }),
    ).not.toBeInTheDocument();
    expect(
      within(menu()).getByRole('link', { name: 'Meus potes', hidden: true }),
    ).toHaveAttribute('aria-current', 'page');
  });
});
