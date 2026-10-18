import { createFileRoute, Navigate } from '@tanstack/react-router';
import { useFlowNavigate } from '../../../app/flow';
import { useAppData } from '../../../app/store';
import { Button } from '../../../components/Button';
import { Slip } from '../../../components/Slip';
import { drawnToday } from '../../../domain/reducer';

export const Route = createFileRoute('/_app/_flow/jars/task')({
  component: CurrentTask,
});

function CurrentTask() {
  const task = useAppData((data) => drawnToday(data, new Date()));
  const flowNavigate = useFlowNavigate();

  if (!task) return <Navigate to="/jars" replace />;

  return (
    <div className="animate-fade-in pt-10 text-center">
      <h1 className="text-[13px] tracking-[.04em] text-text-secondary">
        Sua tarefa de hoje
      </h1>
      <Slip
        variant="card"
        text={task.text}
        jar={task.jar}
        className="mx-auto mt-7"
      />
      <p className="mt-7.5 text-[14.5px] text-pretty text-text-secondary">
        Tentar já conta. Um passinho de cada vez.
      </p>
      <div className="mt-11 flex flex-col items-center gap-3">
        <Button onClick={() => flowNavigate({ to: '/jars/done' })}>
          Concluí
        </Button>
        <Button
          variant="secondary"
          onClick={() => flowNavigate({ to: '/jars/not-done' })}
        >
          Não consegui hoje
        </Button>
      </div>
    </div>
  );
}
