import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { JarIllustration } from '../../../../components/jars/JarIllustration';
import { Button, buttonClass } from '../../../../components/ui/Button';
import { useAppData } from '../../../../stores/appData';
import { jarSchema } from '../../../../types/model';
import { isWeekComplete } from '../../../../utils/week';

export const Route = createFileRoute('/_app/_flow/jars/empty')({
  validateSearch: z.object({ jar: jarSchema }),
  component: EmptyJar,
});

function EmptyJar() {
  const { jar } = Route.useSearch();
  const weekComplete = useAppData(
    (data) => jar === 'weekly' && isWeekComplete(data.tasks),
  );
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in pt-15 text-center">
      <div className="flex justify-center">
        <JarIllustration kind={jar} size="md" slips={0} />
      </div>
      <h1 className="mt-8.5 mb-2 text-[24px] leading-[1.3] text-pretty">
        {weekComplete
          ? 'Semana completa. Que semana, hein?'
          : 'Esse pote está vazio por enquanto.'}
      </h1>
      <p className="text-[15px] text-pretty text-text-secondary">
        {weekComplete
          ? 'Você fez tudo o que tinha combinado consigo. O pote se enche de novo na próxima semana.'
          : 'Quando quiser, coloque uma tarefa nele. Ou escolha outro pote hoje.'}
      </p>
      <div className="mt-9 flex flex-col items-center gap-3">
        {!weekComplete && (
          <Link
            to="/new-task"
            search={{ jar }}
            replace
            className={buttonClass('primary')}
          >
            Colocar uma tarefa
          </Link>
        )}
        <Button
          variant="quiet"
          onClick={() => navigate({ to: '/jars', replace: true })}
        >
          Voltar aos potes
        </Button>
      </div>
    </div>
  );
}
