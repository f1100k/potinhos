import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { poteSchema } from '../../../domain/types';

export const Route = createFileRoute('/_app/_fluxo/potes/sorteio')({
  validateSearch: z.object({ pote: poteSchema }),
  component: Draw,
});

function Draw() {
  return <h1>Sorteio</h1>;
}
