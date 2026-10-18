import { createFileRoute, redirect } from '@tanstack/react-router';
import { consumirFluxo } from '../../app/fluxo';

/** Fluxo do sorteio: só abre por uma ação dentro do app. */
export const Route = createFileRoute('/_app/_fluxo')({
  beforeLoad: ({ cause }) => {
    if (cause === 'enter' && !consumirFluxo()) {
      throw redirect({ to: '/potes', replace: true });
    }
  },
});
