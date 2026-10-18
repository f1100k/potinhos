import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { optionalParam } from '../../app/searchParams';
import { isoDateSchema } from '../../domain/types';

const ACHIEVEMENT_TABS = ['week', 'month'] as const;

export const Route = createFileRoute('/_app/achievements')({
  validateSearch: z.object({
    tab: z.enum(ACHIEVEMENT_TABS).catch('week'),
    week: optionalParam(isoDateSchema),
  }),
  component: Achievements,
});

function Achievements() {
  return <h1>Pote de conquistas</h1>;
}
