import { createFileRoute } from '@tanstack/react-router';
import { deleteTaskWithUndo } from '../../../components/jars/deleteTaskWithUndo';
import { JarTargets } from '../../../components/jars/JarTargets';
import { JAR_NAMES } from '../../../components/jars/jarNames';
import { toast } from '../../../components/ui/Toast';
import { useFlowNavigate } from '../../../features/jars/hooks/useFlow';
import { dispatch, useAppData } from '../../../stores/appData';
import { JARS } from '../../../types/model';

export const Route = createFileRoute('/_app/pending')({
  component: Pending,
});

function Pending() {
  const allTasks = useAppData((data) => data.tasks);
  const pending = allTasks.filter((t) => t.status === 'pending');
  const flowNavigate = useFlowNavigate();

  function resume(taskId: string) {
    dispatch({ type: 'draw', taskId, now: new Date() });
    flowNavigate({ to: '/jars/task' });
  }

  return (
    <div className="mx-auto max-w-130 animate-fade-in pt-7">
      <h1 className="mb-1.5 text-[24px]">Pendentes</h1>
      <p className="text-[14.5px] text-pretty text-text-secondary">
        Coisas que ficaram esperando. Elas não têm pressa.
      </p>
      {pending.length === 0 ? (
        <p className="mt-15 text-center text-[15.5px] text-text-secondary">
          Nada pendente por aqui.
        </p>
      ) : (
        <ul className="mt-6.5 flex flex-col gap-2.5">
          {pending.map((task) => (
            <li
              key={task.id}
              className="rounded-card border-[1.5px] border-dashed border-border bg-surface px-4 py-3.5"
            >
              <div className="text-[16px]">{task.text}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => resume(task.id)}
                  className="min-h-10 rounded-pill bg-accent px-4 py-2.25 text-[13.5px] text-on-accent"
                >
                  Retomar agora
                </button>
                <JarTargets
                  jars={JARS}
                  onPick={(jar) => {
                    dispatch({ type: 'pendingToJar', id: task.id, jar });
                    toast(`De volta ao pote ${JAR_NAMES[jar]}.`);
                  }}
                />
                <button
                  type="button"
                  onClick={() => deleteTaskWithUndo(task)}
                  className="min-h-10 px-2.5 text-[13.5px] text-text-secondary"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
