import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';

export const Route = createFileRoute('/_app/cafe')({
  validateSearch: z.object({
    from: z.enum(['landing', 'app']).catch('app'),
  }),
  component: Cafe,
});

function Cafe() {
  return <h1>Me paga um café?</h1>;
}
