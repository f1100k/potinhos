import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useFlowNavigate } from '../../../app/flow';
import { dispatch, newId, useAppData } from '../../../app/store';
import { Button } from '../../../components/Button';
import type { WeekDecision } from '../../../domain/types';
import { leftovers } from '../../../domain/week';

export const Route = createFileRoute('/_app/_flow/jars/weekend')({
  component: Weekend,
});

const DECISIONS: readonly { value: WeekDecision; label: string }[] = [
  { value: 'carry', label: 'Levar para a próxima semana' },
  { value: 'pending', label: 'Deixar pendente' },
  { value: 'drop', label: 'Deixar ir' },
];

const DECISION_CLASS =
  'min-h-10 rounded-pill border-[1.5px] border-weekly-border bg-surface px-3.5 py-2.25 text-[13.5px] text-weekly-fg aria-pressed:bg-weekly-fg aria-pressed:text-on-accent';

function Weekend() {
  const [left] = useState(() => leftovers(useAppData.getState().tasks));
  const [decisions, setDecisions] = useState<Record<string, WeekDecision>>({});
  const flowNavigate = useFlowNavigate();
  const navigate = useNavigate();

  if (left.length === 0) return <Navigate to="/jars" replace />;

  function closeWeek() {
    const closedWeek = useAppData.getState().meta.weekStart;
    dispatch({
      type: 'closeWeek',
      decisions,
      now: new Date(),
      ids: left.map(() => newId()),
    });
    flowNavigate({ to: '/jars/new-week', search: { week: closedWeek } });
  }

  return (
    <div className="animate-fade-in pt-9">
      <div className="text-center">
        <div className="inline-block rounded-pill bg-weekly-bg px-2.5 py-1 text-[12px] text-weekly-fg">
          Pote Semanal
        </div>
        <h1 className="mt-4 mb-2 text-[26px] leading-[1.25] text-pretty">
          Essa semana foi do jeito que deu.
        </h1>
        <p className="text-[15px] text-pretty text-text-secondary">
          O que fazemos com esses?
        </p>
      </div>
      <ul className="mt-7.5 flex flex-col gap-3.5">
        {left.map((task) => {
          const chosen = decisions[task.id] ?? 'carry';
          return (
            <li
              key={task.id}
              className="rounded-card-md border-[1.5px] border-border bg-surface px-4.5 py-4"
            >
              <div className="text-[16.5px]">{task.text}</div>
              <fieldset className="mt-3.5 flex flex-wrap gap-2">
                <legend className="sr-only">
                  O que fazer com “{task.text}”
                </legend>
                {DECISIONS.map((decision) => (
                  <button
                    key={decision.value}
                    type="button"
                    aria-pressed={chosen === decision.value}
                    className={DECISION_CLASS}
                    onClick={() =>
                      setDecisions((current) => ({
                        ...current,
                        [task.id]: decision.value,
                      }))
                    }
                  >
                    {decision.label}
                  </button>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ul>
      <div className="mt-9 flex flex-col items-center gap-3">
        <Button variant="weekly" onClick={closeWeek}>
          Fechar a semana
        </Button>
        <Button
          variant="quiet"
          onClick={() => navigate({ to: '/jars', replace: true })}
        >
          Depois
        </Button>
      </div>
    </div>
  );
}
