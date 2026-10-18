import { createFileRoute, Navigate, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { JarIllustration } from '../../../../components/jars/JarIllustration';
import { Slip } from '../../../../components/jars/Slip';
import { Button } from '../../../../components/ui/Button';
import { SkipAnimation } from '../../../../features/jars/components/SkipAnimation';
import {
  type SoundCue,
  useSounds,
} from '../../../../features/jars/hooks/useSounds';
import { usePhase } from '../../../../features/jars/hooks/useTimeline';
import { dispatch, newId, useAppData } from '../../../../stores/appData';
import { drawnToday } from '../../../../stores/appReducer';

export const Route = createFileRoute('/_app/_flow/jars/done')({
  component: Done,
});

const DONE_TIMELINE = [
  ['fold', 0],
  ['float', 1200],
  ['land', 2900],
  ['message', 3900],
] as const;

const DONE_SOUNDS: Partial<
  Record<(typeof DONE_TIMELINE)[number][0], SoundCue[]>
> = {
  fold: [{ sound: 'doneFold' }],
  land: [{ sound: 'doneTap' }],
};

function Done() {
  const [task] = useState(() => drawnToday(useAppData.getState(), new Date()));
  const achievementCount = useAppData((data) => data.achievements.length);
  const [countBefore] = useState(achievementCount);
  const [phase, skipToEnd] = usePhase(DONE_TIMELINE);
  useSounds(DONE_SOUNDS[phase]);
  const navigate = useNavigate();

  useEffect(() => {
    if (task) {
      dispatch({ type: 'complete', achievementId: newId(), now: new Date() });
    }
  }, [task]);

  if (!task) return <Navigate to="/jars" replace />;

  const landed = phase === 'land' || phase === 'message';

  return (
    <div className="pt-10 text-center">
      <h1 className="sr-only">Concluí</h1>
      {phase !== 'message' && <SkipAnimation onSkip={skipToEnd} />}
      <div className="relative h-117.5">
        {phase === 'fold' && (
          <div
            className="absolute top-0 left-1/2 -ml-37.5 w-75"
            style={{ animation: 'foldPaper 1.1s cubic-bezier(.4,0,.2,1) both' }}
          >
            <Slip
              variant="card"
              text={task.text}
              jar={task.jar}
              className="[&>div:first-child]:animate-[fadeIn_.4s_ease_reverse_both]"
            />
          </div>
        )}
        {phase === 'float' && (
          <div
            className="absolute top-0 left-1/2 -ml-37.5 flex h-29.5 w-75 items-center justify-center"
            style={{
              animation: 'floatToJar 1.7s cubic-bezier(.45,.05,.35,1) both',
            }}
          >
            <Slip variant="folded" />
          </div>
        )}
        <div className="absolute top-75 left-1/2 -ml-15">
          <JarIllustration
            kind="achievements"
            size="md"
            slips={landed ? achievementCount : countBefore}
            glow={landed}
          />
        </div>
      </div>
      <div aria-live="polite">
        {phase === 'message' && (
          <div className="animate-fade-up">
            <h2 className="mb-2 text-[26px]">Olha só você!</h2>
            <p className="text-[15px] text-pretty text-text-secondary">
              Guardei esse no seu pote de conquistas.
            </p>
            <div className="mt-9 flex flex-col items-center gap-3">
              <Button onClick={() => navigate({ to: '/jars', replace: true })}>
                Voltar aos potes
              </Button>
              <Button
                variant="achievements"
                onClick={() =>
                  navigate({
                    to: '/achievements',
                    search: { tab: 'week' },
                    replace: true,
                  })
                }
              >
                Ver conquistas
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
