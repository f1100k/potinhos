import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { optional } from '../../app/search';
import { isoDateSchema } from '../../domain/types';

export const ACHIEVEMENT_TABS = ['week', 'month'] as const;
export type AchievementTab = (typeof ACHIEVEMENT_TABS)[number];

export const Route = createFileRoute('/_app/achievements')({
  validateSearch: z.object({
    tab: z.enum(ACHIEVEMENT_TABS).catch('week'),
    week: optional(isoDateSchema),
  }),
  component: Achievements,
});

function Achievements() {
  return <h1>Pote de conquistas</h1>;
}
