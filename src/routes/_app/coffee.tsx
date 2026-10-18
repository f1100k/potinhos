import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_app/coffee')({
  validateSearch: z.object({
    from: z.enum(['landing', 'app']).catch('app'),
  }),
  component: Coffee,
});

function Coffee() {
  return <h1>Me paga um café?</h1>;
}
