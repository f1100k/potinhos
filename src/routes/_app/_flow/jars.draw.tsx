import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { jarSchema } from '../../../domain/types';

export const Route = createFileRoute('/_app/_flow/jars/draw')({
  validateSearch: z.object({ jar: jarSchema }),
  component: Draw,
});

function Draw() {
  return <h1>Sorteio</h1>;
}
