import {
  concluir,
  type DecisaoSemana,
  type EscolhaNaoConsegui,
  fecharSemana,
  moverPote,
  naoConsegui,
  voltarAoPote,
} from './rules';
import {
  type AppData,
  type ISODate,
  MAX_FREQ,
  MIN_FREQ,
  type Pote,
  type Task,
} from './types';
import { metaFechada, mondayOf } from './week';

export const SCHEMA_VERSION = 1;

/** Primeiro uso: potes vazios, sem tarefas de exemplo. */
export function createInitialData(now: Date): AppData {
  return {
    tasks: [],
    done: [],
    settings: { sounds: true },
    meta: {
      schemaVersion: SCHEMA_VERSION,
      visited: false,
      weekStart: mondayOf(now),
      lastWeekClosed: null,
    },
    current: null,
  };
}

export type AppAction =
  | { type: 'visit' }
  | { type: 'addTask'; id: string; text: string; pote: Pote; freq?: number }
  | { type: 'editTask'; id: string; text: string }
  | { type: 'moveTask'; id: string; pote: Pote }
  | { type: 'deleteTask'; id: string }
  | { type: 'restoreTask'; task: Task; index: number }
  | { type: 'setFreq'; id: string; freq: number }
  | { type: 'togglePause'; id: string }
  | { type: 'draw'; taskId: string; date: ISODate }
  | { type: 'clearCurrent' }
  | { type: 'conclude'; conquistaId: string; date: ISODate }
  | { type: 'notDone'; escolha: EscolhaNaoConsegui }
  | { type: 'pendingToPote'; id: string; pote: Pote }
  | {
      type: 'closeWeek';
      decisoes: Readonly<Record<string, DecisaoSemana>>;
      now: Date;
      ids: readonly string[];
    }
  | { type: 'setSounds'; on: boolean }
  | { type: 'replace'; data: AppData }
  | { type: 'reset'; now: Date };

const clampFreq = (n: number) =>
  Math.min(MAX_FREQ, Math.max(MIN_FREQ, Math.round(n)));

const updateTask = (
  data: AppData,
  id: string,
  fn: (t: Task) => Task,
): AppData => ({
  ...data,
  tasks: data.tasks.map((t) => (t.id === id ? fn(t) : t)),
});

export function appReducer(data: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'visit':
      if (data.meta.visited) return data;
      return { ...data, meta: { ...data.meta, visited: true } };

    case 'addTask': {
      const text = action.text.trim();
      if (!text) return data;
      const task: Task =
        action.pote === 'semanal'
          ? {
              id: action.id,
              text,
              pote: 'semanal',
              freq: clampFreq(action.freq ?? 2),
              doneWeek: 0,
              extra: 0,
            }
          : { id: action.id, text, pote: action.pote };
      return { ...data, tasks: [...data.tasks, task] };
    }

    case 'editTask': {
      const text = action.text.trim();
      if (!text) return data;
      return updateTask(data, action.id, (t) => ({ ...t, text }));
    }

    case 'moveTask':
      return updateTask(data, action.id, (t) =>
        t.pote === action.pote ? t : moverPote(t, action.pote),
      );

    case 'deleteTask':
      return {
        ...data,
        tasks: data.tasks.filter((t) => t.id !== action.id),
        current: data.current?.taskId === action.id ? null : data.current,
      };

    case 'restoreTask': {
      if (data.tasks.some((t) => t.id === action.task.id)) return data;
      const tasks = [...data.tasks];
      tasks.splice(Math.min(action.index, tasks.length), 0, action.task);
      return { ...data, tasks };
    }

    case 'setFreq':
      return updateTask(data, action.id, (t) => ({
        ...t,
        freq: clampFreq(action.freq),
      }));

    case 'togglePause':
      return updateTask(data, action.id, ({ paused, ...t }) =>
        paused ? t : { ...t, paused: true },
      );

    case 'draw':
      return { ...data, current: { taskId: action.taskId, date: action.date } };

    case 'clearCurrent':
      return data.current ? { ...data, current: null } : data;

    case 'conclude': {
      if (!data.current) return data;
      const r = concluir(data.tasks, data.done, data.current.taskId, {
        id: action.conquistaId,
        date: action.date,
      });
      return { ...data, ...r, current: null };
    }

    case 'notDone': {
      if (!data.current) return data;
      return {
        ...data,
        tasks: naoConsegui(data.tasks, data.current.taskId, action.escolha),
        current: null,
      };
    }

    case 'pendingToPote':
      return updateTask(data, action.id, (t) => voltarAoPote(t, action.pote));

    case 'closeWeek': {
      let i = 0;
      const newId = () =>
        action.ids[i++] ?? `semana-${action.now.getTime()}-${i}`;
      return {
        ...data,
        tasks: fecharSemana(data.tasks, action.decisoes, newId),
        meta: metaFechada(data.meta, action.now),
      };
    }

    case 'setSounds':
      return { ...data, settings: { ...data.settings, sounds: action.on } };

    case 'replace':
      return action.data;

    case 'reset':
      return createInitialData(action.now);
  }
}

/** A tarefa sorteada hoje, se ainda existir. Vale até o fim do dia. */
export function tarefaAtual(data: AppData, hoje: ISODate): Task | null {
  const c = data.current;
  if (!c || c.date !== hoje) return null;
  return data.tasks.find((t) => t.id === c.taskId) ?? null;
}
