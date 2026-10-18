import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { JARS } from '../../../domain/types';

export const Route = createFileRoute('/_app/_flow/jars/return')({
  validateSearch: z.object({ destination: z.enum([...JARS, 'pending']) }),
  component: Return,
});

function Return() {
  return <h1>Papelzinho voltando</h1>;
}
