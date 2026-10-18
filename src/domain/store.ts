import {
  closeWeek,
  complete,
  moveToJar,
  type NotDoneChoice,
  notDone,
  returnToJar,
  type WeekDecision,
} from './rules';
import {
  type AppData,
  type ISODate,
  type Jar,
  MAX_FREQ,
  MIN_FREQ,
  type Task,
} from './types';
import { closeWeekMeta, mondayOf } from './week';

export const SCHEMA_VERSION = 2;

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
  | { type: 'addTask'; id: string; text: string; jar: Jar; freq?: number }
  | { type: 'editTask'; id: string; text: string }
  | { type: 'moveTask'; id: string; jar: Jar }
  | { type: 'deleteTask'; id: string }
  | { type: 'restoreTask'; task: Task; index: number }
  | { type: 'setFreq'; id: string; freq: number }
  | { type: 'togglePause'; id: string }
  | { type: 'draw'; taskId: string; date: ISODate }
  | { type: 'clearCurrent' }
  | { type: 'complete'; achievementId: string; date: ISODate }
  | { type: 'notDone'; choice: NotDoneChoice }
  | { type: 'pendingToJar'; id: string; jar: Jar }
  | {
      type: 'closeWeek';
      decisions: Readonly<Record<string, WeekDecision>>;
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
        action.jar === 'weekly'
          ? {
              id: action.id,
              text,
              jar: 'weekly',
              freq: clampFreq(action.freq ?? 2),
              doneWeek: 0,
              extra: 0,
            }
          : { id: action.id, text, jar: action.jar };
      return { ...data, tasks: [...data.tasks, task] };
    }

    case 'editTask': {
      const text = action.text.trim();
      if (!text) return data;
      return updateTask(data, action.id, (t) => ({ ...t, text }));
    }

    case 'moveTask':
      return updateTask(data, action.id, (t) =>
        t.jar === action.jar ? t : moveToJar(t, action.jar),
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

    case 'complete': {
      if (!data.current) return data;
      const r = complete(data.tasks, data.done, data.current.taskId, {
        id: action.achievementId,
        date: action.date,
      });
      return { ...data, ...r, current: null };
    }

    case 'notDone': {
      if (!data.current) return data;
      return {
        ...data,
        tasks: notDone(data.tasks, data.current.taskId, action.choice),
        current: null,
      };
    }

    case 'pendingToJar':
      return updateTask(data, action.id, (t) => returnToJar(t, action.jar));

    case 'closeWeek': {
      let i = 0;
      const newId = () =>
        action.ids[i++] ?? `week-${action.now.getTime()}-${i}`;
      return {
        ...data,
        tasks: closeWeek(data.tasks, action.decisions, newId),
        meta: closeWeekMeta(data.meta, action.now),
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

export function currentTask(data: AppData, today: ISODate): Task | null {
  const c = data.current;
  if (!c || c.date !== today) return null;
  return data.tasks.find((t) => t.id === c.taskId) ?? null;
}
