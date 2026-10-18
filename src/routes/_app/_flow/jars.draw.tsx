import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { z } from 'zod';
import { useFlowNavigate } from '../../../app/flow';
import { useAppData } from '../../../app/store';
import { useAfter, usePhase } from '../../../app/timeline';
import { JarIllustration } from '../../../components/JarIllustration';
import { Slip } from '../../../components/Slip';
import { slipCount } from '../../../domain/drawing';
import { drawnToday } from '../../../domain/reducer';
import { jarSchema } from '../../../domain/types';

export const Route = createFileRoute('/_app/_flow/jars/draw')({
  validateSearch: z.object({ jar: jarSchema }),
  component: Draw,
});

const DRAW_TIMELINE = [
  ['wobble', 0],
  ['rise', 900],
  ['unfold', 2400],
] as const;
const DRAW_MS = 4000;

const CAPTIONS = {
  wobble: 'Deixa eu ver o que tem aqui…',
  rise: 'Saiu um papelzinho.',
  unfold: 'Olha só o que veio.',
} as const;

function Draw() {
  const { jar } = Route.useSearch();
  const [task] = useState(() => drawnToday(useAppData.getState(), new Date()));
  const slipsInJar = useAppData((data) => slipCount(data.tasks, jar));
  const phase = usePhase(DRAW_TIMELINE);
  const flowNavigate = useFlowNavigate();

  useAfter(DRAW_MS, () => flowNavigate({ to: '/jars/task' }));

  if (!task) return <Navigate to="/jars" replace />;

  return (
    <div className="pt-5 text-center">
      <h1 className="sr-only">Sorteio</h1>
      <p
        aria-live="polite"
        className="min-h-5.5 animate-fade-in text-[15px] text-text-secondary"
      >
        {CAPTIONS[phase]}
      </p>
      <div className="relative mt-2.5 h-115">
        <div
          className="absolute bottom-7.5 left-1/2 -ml-20 origin-bottom"
          style={{
            animation:
              phase === 'wobble' ? 'wobble .9s ease-in-out both' : undefined,
          }}
        >
          <JarIllustration
            kind={jar}
            size="lg"
            slips={phase === 'wobble' ? slipsInJar : slipsInJar - 1}
          />
        </div>
        {phase === 'rise' && (
          <div
            className="absolute bottom-49 left-1/2"
            style={{ animation: 'riseUp 1.4s cubic-bezier(.3,.7,.3,1) both' }}
          >
            <Slip variant="folded" />
          </div>
        )}
        {phase === 'unfold' && (
          <div
            className="absolute top-5 left-1/2 -ml-34"
            style={{ animation: 'unfold 1.4s cubic-bezier(.4,0,.2,1) both' }}
          >
            <Slip
              variant="unfolded"
              text={task.text}
              className="[&>div]:animate-[fadeUp_.9s_ease_.8s_both]"
            />
          </div>
        )}
      </div>
      <p className="mt-2 text-[12px] text-text-tertiary">
        Sorteado agora. Não dá para sortear de novo, e tudo bem.
      </p>
    </div>
  );
}
