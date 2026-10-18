import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { poteSchema } from '../../../domain/types';

export const Route = createFileRoute('/_app/_fluxo/potes/vazio')({
  validateSearch: z.object({ pote: poteSchema }),
  component: Vazio,
});

function Vazio() {
  return <h1>Pote vazio</h1>;
}
