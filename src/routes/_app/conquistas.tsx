import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { opcional } from '../../app/search';
import { isoDateSchema } from '../../domain/types';

export const ACH_TABS = ['semana', 'mes'] as const;
export type AchTab = (typeof ACH_TABS)[number];

export const Route = createFileRoute('/_app/conquistas')({
  validateSearch: z.object({
    tab: z.enum(ACH_TABS).catch('semana'),
    semana: opcional(isoDateSchema),
  }),
  component: Conquistas,
});

function Conquistas() {
  return <h1>Pote de conquistas</h1>;
}
