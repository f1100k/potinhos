import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { JarIllustration } from '../../../../components/jars/JarIllustration';
import { JAR_NAMES } from '../../../../components/jars/jarNames';
import { Slip } from '../../../../components/jars/Slip';
import { toast } from '../../../../components/ui/Toast';
import { SkipAnimation } from '../../../../features/jars/components/SkipAnimation';
import {
  type SoundCue,
  useSounds,
} from '../../../../features/jars/hooks/useSounds';
import { useAfter } from '../../../../features/jars/hooks/useTimeline';
import { dispatch, useAppData } from '../../../../stores/appData';
import { drawnToday } from '../../../../stores/appReducer';
import { JARS, type Jar, type NotDoneChoice } from '../../../../types/model';

export const Route = createFileRoute('/_app/_flow/jars/return')({
  validateSearch: z.object({ destination: z.enum([...JARS, 'pending']) }),
  component: Return,
});

const RETURN_MS = 2300;
const RETURN_SOUNDS: SoundCue[] = [{ sound: 'returnRustle' }];

function choiceFor(destination: Jar | 'pending', from: Jar): NotDoneChoice {
  if (destination === 'pending') return { kind: 'pending' };
  if (destination === from) return { kind: 'return' };
  return { kind: 'move', jar: destination };
}

function Return() {
  const { destination } = Route.useSearch();
  const [task] = useState(() => drawnToday(useAppData.getState(), new Date()));
  const navigate = useNavigate();
  useSounds(task ? RETURN_SOUNDS : undefined);

  useEffect(() => {
    if (task) {
      dispatch({
        type: 'notDone',
        choice: choiceFor(destination, task.jar),
        now: new Date(),
      });
    }
  }, [task, destination]);

  function goHome() {
    navigate({ to: '/jars', replace: true });
    toast('Guardado. Sem pressa.');
  }

  useAfter(RETURN_MS, goHome);

  if (!task) return <Navigate to="/jars" replace />;

  const jar = destination === 'pending' ? task.jar : destination;

  return (
    <div className="pt-10 text-center">
      <h1 className="sr-only">Papelzinho voltando</h1>
      <SkipAnimation onSkip={goHome} />
      <p className="animate-fade-in text-[15px] text-text-secondary">
        Guardando com calma…
      </p>
      <div className="relative mt-2.5 h-110">
        <div
          className="absolute top-0 left-1/2 -ml-35 flex h-24 w-70 items-center justify-center"
          style={{
            animation: 'floatToJar 1.9s cubic-bezier(.45,.05,.35,1) both',
          }}
        >
          <Slip variant="folded" />
        </div>
        <div className="absolute top-72.5 left-1/2 -ml-15">
          <JarIllustration kind={jar} size="md" slips={0} />
          <div className="mt-2.5 text-[14px] text-text-secondary">
            {destination === 'pending'
              ? 'Pendentes'
              : `Pote ${JAR_NAMES[destination]}`}
          </div>
        </div>
      </div>
    </div>
  );
}
