import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { jarSchema } from '../../../domain/types';

export const Route = createFileRoute('/_app/_flow/jars/empty')({
  validateSearch: z.object({ jar: jarSchema }),
  component: EmptyJar,
});

function EmptyJar() {
  return <h1>Pote vazio</h1>;
}
