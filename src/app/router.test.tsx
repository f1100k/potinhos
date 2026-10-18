import { act, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../test/renderApp';
import { liberarFluxo } from './fluxo';

describe('router', () => {
  it('URL desconhecida volta para a landing', async () => {
    const router = await renderApp('/nao-existe');
    expect(router.state.location.pathname).toBe('/');
  });

  it('parâmetro inválido vira o padrão', async () => {
    const router = await renderApp('/conquistas?tab=xyz');
    expect(router.state.location.search).toEqual({ tab: 'semana' });
  });

  it('abrir uma tela do fluxo direto pela URL leva para os potes', async () => {
    const router = await renderApp('/potes/sorteio?pote=simples');
    expect(router.state.location.pathname).toBe('/potes');
  });

  it('o fluxo abre por uma ação dentro do app', async () => {
    const router = await renderApp('/potes');
    await act(async () => {
      liberarFluxo();
      await router.navigate({
        to: '/potes/sorteio',
        search: { pote: 'semanal' },
      });
    });
    expect(router.state.location.pathname).toBe('/potes/sorteio');
    expect(router.state.location.search).toEqual({ pote: 'semanal' });
    expect(
      screen.getByRole('heading', { name: 'Sorteio' }),
    ).toBeInTheDocument();
  });

  it('voltar pelo navegador até o fluxo leva para os potes', async () => {
    const router = await renderApp('/potes');
    await act(async () => {
      liberarFluxo();
      await router.navigate({ to: '/potes/tarefa' });
    });
    await act(() => router.navigate({ to: '/pendentes' }));
    await act(async () => {
      router.history.back();
      await router.load();
    });
    expect(router.state.location.pathname).toBe('/potes');
  });
});
