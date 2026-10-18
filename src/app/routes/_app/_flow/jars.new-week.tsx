import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { JarIllustration } from '../../../../components/jars/JarIllustration';
import { Button } from '../../../../components/ui/Button';
import { usePhase } from '../../../../features/jars/hooks/useTimeline';
import { useAppData } from '../../../../stores/appData';
import { isoDateSchema } from '../../../../types/model';
import { slipCount } from '../../../../utils/drawing';

export const Route = createFileRoute('/_app/_flow/jars/new-week')({
  validateSearch: z.object({ week: isoDateSchema }),
  component: NewWeek,
});

const NEW_WEEK_TIMELINE = [
  ['fall', 0],
  ['invite', 3200],
] as const;

function NewWeek() {
  const { week } = Route.useSearch();
  const weeklySlips = useAppData((data) => slipCount(data.tasks, 'weekly'));
  const phase = usePhase(NEW_WEEK_TIMELINE);
  const navigate = useNavigate();

  return (
    <div className="pt-10 text-center">
      <h1 className="mb-2 animate-fade-in text-[26px] leading-[1.25]">
        Semana fechada.
      </h1>
      <p className="animate-[fadeIn_.8s_ease_.3s_both] text-[15px] text-text-secondary">
        O pote Semanal se enche de novo para a próxima.
      </p>
      <div className="mt-15 flex justify-center">
        <JarIllustration kind="weekly" size="lg" slips={weeklySlips} falling />
      </div>
      {phase === 'invite' && (
        <div className="mt-12 animate-fade-up">
          <p className="mb-5 text-[17px] text-pretty">
            Quer ver o que você fez essa semana?
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={() =>
                navigate({
                  to: '/achievements',
                  search: { tab: 'week', week },
                  replace: true,
                })
              }
            >
              Abrir pote de conquistas
            </Button>
            <Button
              variant="quiet"
              onClick={() => navigate({ to: '/jars', replace: true })}
            >
              Agora não
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
