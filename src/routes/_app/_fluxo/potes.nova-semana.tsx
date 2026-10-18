import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { isoDateSchema } from '../../../domain/types';

export const Route = createFileRoute('/_app/_fluxo/potes/nova-semana')({
  validateSearch: z.object({ semana: isoDateSchema }),
  component: NovaSemana,
});

function NovaSemana() {
  return <h1>Nova semana</h1>;
}
