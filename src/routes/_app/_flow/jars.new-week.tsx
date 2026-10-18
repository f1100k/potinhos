import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { isoDateSchema } from '../../../domain/types';

export const Route = createFileRoute('/_app/_flow/jars/new-week')({
  validateSearch: z.object({ week: isoDateSchema }),
  component: NewWeek,
});

function NewWeek() {
  return <h1>Nova semana</h1>;
}
