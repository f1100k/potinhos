import type { AppAction, AppData, Task } from '../types/model';
import { toISODate } from '../utils/dates';
import {
  clampFreq,
  complete,
  isActiveWeekly,
  moveToJar,
  newTask,
  notDone,
  returnToJar,
} from '../utils/tasks';
import { closeWeek, closeWeekMeta, mondayOf } from '../utils/week';

export function createInitialData(now: Date): AppData {
  return {
    tasks: [],
    achievements: [],
    settings: { sounds: true },
    meta: {
      visited: false,
      weekStart: mondayOf(now),
      lastWeekClosed: null,
    },
    drawn: null,
  };
}

/** Returns `data` itself when nothing changes, so nothing re-renders or saves. */
function updateTask(
  data: AppData,
  id: string,
  update: (task: Task) => Task,
): AppData {
  let changed = false;
  const tasks = data.tasks.map((task) => {
    if (task.id !== id) return task;
    const updated = update(task);
    if (updated !== task) changed = true;
    return updated;
  });
  return changed ? { ...data, tasks } : data;
}

const updateActiveWeekly = (
  data: AppData,
  id: string,
  update: (task: Task) => Task,
): AppData =>
  updateTask(data, id, (task) => (isActiveWeekly(task) ? update(task) : task));

const hasTask = (data: AppData, id: string) =>
  data.tasks.some((t) => t.id === id);

export function appReducer(data: AppData, action: AppAction): AppData {
  switch (action.type) {
    case 'visit':
      if (data.meta.visited) return data;
      return { ...data, meta: { ...data.meta, visited: true } };

    case 'addTask': {
      const text = action.text.trim();
      if (!text) return data;
      const task = newTask(action.id, text, action.jar, action.freq);
      return { ...data, tasks: [...data.tasks, task] };
    }

    case 'editTask': {
      const text = action.text.trim();
      if (!text) return data;
      return updateTask(data, action.id, (task) =>
        task.text === text ? task : { ...task, text },
      );
    }

    case 'moveTask':
      return updateTask(data, action.id, (task) =>
        task.jar === action.jar ? task : moveToJar(task, action.jar),
      );

    case 'deleteTask':
      if (!hasTask(data, action.id)) return data;
      return {
        ...data,
        tasks: data.tasks.filter((t) => t.id !== action.id),
        drawn: data.drawn?.taskId === action.id ? null : data.drawn,
      };

    case 'restoreTask': {
      if (hasTask(data, action.task.id)) return data;
      const tasks = [...data.tasks];
      tasks.splice(Math.min(action.index, tasks.length), 0, action.task);
      return { ...data, tasks };
    }

    case 'setFreq': {
      const freq = clampFreq(action.freq);
      return updateActiveWeekly(data, action.id, (task) =>
        task.freq === freq ? task : { ...task, freq },
      );
    }

    case 'togglePause':
      return updateActiveWeekly(data, action.id, ({ paused, ...task }) =>
        paused ? task : { ...task, paused: true },
      );

    case 'draw':
      if (!hasTask(data, action.taskId)) return data;
      return {
        ...data,
        drawn: { taskId: action.taskId, date: toISODate(action.now) },
      };

    case 'clearDrawn':
      return data.drawn ? { ...data, drawn: null } : data;

    case 'complete': {
      const task = drawnToday(data, action.now);
      if (!task) return data;
      const { tasks, achievements } = complete(
        data.tasks,
        data.achievements,
        task.id,
        { id: action.achievementId, date: toISODate(action.now) },
      );
      return { ...data, tasks, achievements, drawn: null };
    }

    case 'notDone': {
      const task = drawnToday(data, action.now);
      if (!task) return data;
      return {
        ...data,
        tasks: notDone(data.tasks, task.id, action.choice),
        drawn: null,
      };
    }

    case 'pendingToJar':
      return updateTask(data, action.id, (task) =>
        returnToJar(task, action.jar),
      );

    case 'closeWeek': {
      let next = 0;
      const newId = () =>
        action.ids[next++] ?? `week-${action.now.getTime()}-${next}`;
      return {
        ...data,
        tasks: closeWeek(data.tasks, action.decisions, newId),
        meta: closeWeekMeta(data.meta, action.now),
      };
    }

    case 'setSounds':
      if (data.settings.sounds === action.on) return data;
      return { ...data, settings: { ...data.settings, sounds: action.on } };

    case 'replace':
      return action.data;

    case 'reset':
      return createInitialData(action.now);
  }
}

/** The drawn task only holds until the end of the day it was drawn. */
export function drawnToday(data: AppData, now: Date): Task | null {
  const { drawn } = data;
  if (!drawn || drawn.date !== toISODate(now)) return null;
  return data.tasks.find((t) => t.id === drawn.taskId) ?? null;
}
