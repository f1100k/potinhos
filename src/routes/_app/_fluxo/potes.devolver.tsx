import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { POTES } from '../../../domain/types';

export const Route = createFileRoute('/_app/_fluxo/potes/devolver')({
  validateSearch: z.object({ destino: z.enum([...POTES, 'pendentes']) }),
  component: Return,
});

function Return() {
  return <h1>Papelzinho voltando</h1>;
}
