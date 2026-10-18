import {
  type NavigateOptions,
  type RegisteredRouter,
  type RouteIds,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { useCallback } from 'react';

/** Id da rota sem caminho que agrupa as telas do fluxo do sorteio. */
export const FLUXO_ID: RouteIds<RegisteredRouter['routeTree']> = '/_app/_fluxo';

// O fluxo do sorteio só abre por uma ação dentro do app. Recarregar a página
// ou voltar pelo navegador até uma tela do fluxo leva de volta para os potes.
let liberado = false;

export function liberarFluxo(): void {
  liberado = true;
}

/** Consome a liberação: vale para uma única entrada no fluxo. */
export function consumirFluxo(): boolean {
  const ok = liberado;
  liberado = false;
  return ok;
}

/** Telas do fluxo do sorteio: sem barra inferior e com "Meus potes" ativo. */
export function useNoFluxo(): boolean {
  return useRouterState({
    select: (s) => s.matches.some((m) => m.routeId === FLUXO_ID),
  });
}

/**
 * Navega para uma tela do fluxo. Dentro do fluxo, troca a entrada do
 * histórico em vez de empilhar, para o "voltar" não refazer passos.
 */
export function useIrNoFluxo() {
  const navigate = useNavigate();
  const noFluxo = useNoFluxo();
  return useCallback(
    <TTo extends string>(
      opts: NavigateOptions<RegisteredRouter, string, TTo>,
    ) => {
      liberarFluxo();
      return navigate({ ...opts, replace: noFluxo } as NavigateOptions);
    },
    [navigate, noFluxo],
  );
}
