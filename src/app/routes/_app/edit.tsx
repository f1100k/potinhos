import { createFileRoute } from '@tanstack/react-router';
import { type FormEvent, useState } from 'react';
import { deleteTaskWithUndo } from '../../../components/jars/deleteTaskWithUndo';
import { JarTargets } from '../../../components/jars/JarTargets';
import { JAR_NAMES } from '../../../components/jars/jarNames';
import { FreqStepper } from '../../../components/ui/FreqStepper';
import { SegmentedControl } from '../../../components/ui/SegmentedControl';
import { toast } from '../../../components/ui/Toast';
import { dispatch, useAppData } from '../../../stores/appData';
import { JARS, type Task } from '../../../types/model';
import { jarSearch } from '../../../utils/searchParams';
import { MIN_FREQ } from '../../../utils/tasks';

export const Route = createFileRoute('/_app/edit')({
  validateSearch: jarSearch,
  component: Edit,
});

const TAB_OPTIONS = JARS.map((jar) => ({ value: jar, label: JAR_NAMES[jar] }));

const ACTION_CLASS = 'min-h-10 px-2.5 text-[13.5px] first:pl-0';

function Edit() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const jar = search.jar ?? 'simple';
  const allTasks = useAppData((data) => data.tasks);
  const tasks = allTasks.filter((t) => t.jar === jar && t.status !== 'pending');

  return (
    <div className="mx-auto max-w-130 animate-fade-in pt-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px]">Seus potes</h1>
        <SegmentedControl
          label="Pote"
          options={TAB_OPTIONS}
          value={jar}
          onChange={(next) => navigate({ search: { jar: next } })}
        />
      </div>
      {tasks.length === 0 ? (
        <p className="mt-12 text-center text-[15.5px] text-pretty text-text-secondary">
          Esse pote está vazio por enquanto. Quando quiser, coloque algo nele.
        </p>
      ) : (
        <ul className="mt-5.5 flex flex-col gap-2.5">
          {tasks.map((task) => (
            <EditableTask key={task.id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}

type EditableTaskProps = {
  task: Task;
};

function EditableTask({ task }: EditableTaskProps) {
  const [draft, setDraft] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  function save(event: FormEvent) {
    event.preventDefault();
    if (!draft?.trim()) {
      toast('Escreva a tarefa primeiro, sem pressa.');
      return;
    }
    dispatch({ type: 'editTask', id: task.id, text: draft });
    setDraft(null);
  }

  return (
    <li
      className={`rounded-card border-[1.5px] border-border bg-surface px-4 py-3.5 ${task.paused ? 'opacity-55' : ''}`}
    >
      {draft === null ? (
        <div className="flex items-baseline justify-between gap-3">
          <div className="text-[16px]">{task.text}</div>
          {task.paused && (
            <div className="flex-none text-[12.5px] text-text-secondary">
              pausada
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={save} className="flex gap-2">
          <input
            aria-label="Texto da tarefa"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') setDraft(null);
            }}
            ref={(input) => input?.focus()}
            className="min-w-0 flex-1 rounded-[10px] border-[1.5px] border-border px-3 py-2.5 text-[15.5px] text-text"
          />
          <button
            type="submit"
            className="min-h-touch rounded-[10px] bg-accent px-3.5 text-[14px] text-on-accent"
          >
            Salvar
          </button>
        </form>
      )}

      {task.jar === 'weekly' && (
        <div className="mt-3 flex items-center gap-2.5">
          <FreqStepper
            freq={task.freq ?? MIN_FREQ}
            onChange={(freq) =>
              dispatch({ type: 'setFreq', id: task.id, freq })
            }
            size="sm"
            formatFreq={(times) => `${times}x por semana`}
          />
          <button
            type="button"
            onClick={() => dispatch({ type: 'togglePause', id: task.id })}
            className="ml-auto min-h-9 rounded-pill border-[1.5px] border-weekly-border bg-weekly-bg px-3 py-1.75 text-[12.5px] text-weekly-fg"
          >
            {task.paused ? 'Retomar' : 'Pausar'}
          </button>
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setDraft(task.text)}
          className={`${ACTION_CLASS} text-link`}
        >
          Editar
        </button>
        <button
          type="button"
          aria-expanded={moving}
          onClick={() => setMoving((open) => !open)}
          className={`${ACTION_CLASS} text-link`}
        >
          Mover de pote
        </button>
        <button
          type="button"
          onClick={() => deleteTaskWithUndo(task)}
          className={`${ACTION_CLASS} text-text-secondary`}
        >
          Excluir
        </button>
      </div>
      {moving && (
        <div className="mt-1.5 flex animate-[fadeIn_.4s_ease_both] flex-wrap gap-2">
          <JarTargets
            jars={JARS.filter((other) => other !== task.jar)}
            onPick={(target) => {
              dispatch({ type: 'moveTask', id: task.id, jar: target });
              toast(`Movido para o pote ${JAR_NAMES[target]}.`);
            }}
          />
        </div>
      )}
    </li>
  );
}
