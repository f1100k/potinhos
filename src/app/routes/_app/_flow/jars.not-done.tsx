import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useState } from 'react';
import { JAR_NAMES } from '../../../../components/jars/jarNames';
import { Button } from '../../../../components/ui/Button';
import { useFlowNavigate } from '../../../../features/jars/hooks/useFlow';
import { useAppData } from '../../../../stores/appData';
import { drawnToday } from '../../../../stores/appReducer';
import { JARS, type Jar } from '../../../../types/model';

export const Route = createFileRoute('/_app/_flow/jars/not-done')({
  component: NotDone,
});

const OPTION_CLASS =
  'min-h-13 w-full max-w-85 rounded-card-md border-[1.5px] border-border-soft bg-surface px-5 py-3.5 text-left text-[15.5px]';

const TARGET_CLASS =
  'min-h-11.5 rounded-pill border-[1.5px] border-border-soft bg-surface px-5 py-3 text-[15px]';

function NotDone() {
  const task = useAppData((data) => drawnToday(data, new Date()));
  const [choosingJar, setChoosingJar] = useState(false);
  const flowNavigate = useFlowNavigate();

  if (!task) return <Navigate to="/jars" replace />;

  const goTo = (destination: Jar | 'pending') =>
    flowNavigate({ to: '/jars/return', search: { destination } });

  return (
    <div className="animate-fade-in pt-11 text-center">
      <h1 className="mb-2 text-[26px] leading-[1.25]">
        Tudo bem, amanhã é outro dia.
      </h1>
      <p className="mb-7.5 text-[15px] text-pretty text-text-secondary">
        O que fazemos com esse papelzinho?
      </p>
      <div className="mx-auto max-w-85 rounded-card border-[1.5px] border-border bg-surface px-5.5 py-4.5 text-[17px] text-text-muted">
        {task.text}
      </div>

      {choosingJar ? (
        <div className="mt-8.5 animate-[fadeIn_.5s_ease_both]">
          <h2 className="mb-3.5 text-[14px] text-text-secondary">
            Para qual pote?
          </h2>
          <div className="flex flex-wrap justify-center gap-2.5">
            {JARS.filter((jar) => jar !== task.jar).map((jar) => (
              <button
                key={jar}
                type="button"
                className={TARGET_CLASS}
                onClick={() => goTo(jar)}
              >
                {JAR_NAMES[jar]}
              </button>
            ))}
          </div>
          <Button
            variant="quiet"
            className="mt-5"
            onClick={() => setChoosingJar(false)}
          >
            Voltar
          </Button>
        </div>
      ) : (
        <div className="mt-8.5 flex flex-col items-center gap-3">
          <NotDoneOption
            title={`Devolver ao pote ${JAR_NAMES[task.jar]}`}
            hint="Outro dia eu tento de novo"
            onClick={() => goTo(task.jar)}
          />
          <NotDoneOption
            title="Mudar para outro pote"
            hint="Era mais complexa do que parecia"
            onClick={() => setChoosingJar(true)}
          />
          <NotDoneOption
            title="Deixar como pendente"
            hint="Fica guardada, sem pressa"
            onClick={() => goTo('pending')}
          />
        </div>
      )}
    </div>
  );
}

type OptionProps = {
  title: string;
  hint: string;
  onClick: () => void;
};

function NotDoneOption({ title, hint, onClick }: OptionProps) {
  return (
    <button type="button" className={OPTION_CLASS} onClick={onClick}>
      <span className="block">{title}</span>
      <span className="mt-0.5 block text-[12.5px] text-text-secondary">
        {hint}
      </span>
    </button>
  );
}
