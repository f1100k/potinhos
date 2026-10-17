import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { isActive } from './Shell';

describe('Shell', () => {
  it('a barra inferior tem os 4 itens', () => {
    render(<App initialRoute={{ screen: 'home' }} />);
    const bar = screen.getByRole('navigation', { name: 'Navegação' });
    expect(
      within(bar)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual(['Meus potes', 'Nova tarefa', 'Pendentes', 'Configurações']);
  });

  it('o menu lateral tem os 6 itens e o link do café', () => {
    const { container } = render(<App initialRoute={{ screen: 'home' }} />);
    // No celular o menu lateral fica oculto; aqui só conferimos o conteúdo.
    const menu = container.querySelector<HTMLElement>('nav.sidebar');
    if (!menu) throw new Error('sem menu lateral');
    expect(
      [...menu.querySelectorAll('button')].map((b) => b.textContent),
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
    render(<App initialRoute={{ screen: 'home' }} />);
    const bar = screen.getByRole('navigation', { name: 'Navegação' });
    await userEvent.click(
      within(bar).getByRole('button', { name: 'Pendentes' }),
    );
    expect(
      within(screen.getByRole('navigation', { name: 'Navegação' })).getByRole(
        'button',
        { name: 'Pendentes' },
      ),
    ).toHaveAttribute('aria-current', 'page');
  });

  it('esconde a barra inferior nas telas do fluxo', () => {
    render(<App initialRoute={{ screen: 'task' }} />);
    expect(
      screen.queryByRole('navigation', { name: 'Navegação' }),
    ).not.toBeInTheDocument();
  });

  it('Meus potes fica ativo durante o sorteio', () => {
    expect(isActive('home', 'draw')).toBe(true);
    expect(isActive('home', 'novasemana')).toBe(true);
    expect(isActive('home', 'settings')).toBe(false);
  });
});
