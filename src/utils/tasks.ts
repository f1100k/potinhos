import type {
  Achievement,
  ISODate,
  Jar,
  NotDoneChoice,
  Task,
} from '../types/model';

export const MIN_FREQ = 1;
export const MAX_FREQ = 7;
export const NEW_TASK_FREQ = 2;
const MOVED_TASK_FREQ = 1;

export function clampFreq(freq: number): number {
  return Math.min(MAX_FREQ, Math.max(MIN_FREQ, Math.round(freq)));
}

export function newTask(
  id: string,
  text: string,
  jar: Jar,
  freq = NEW_TASK_FREQ,
): Task {
  if (jar !== 'weekly') return { id, text, jar };
  return { id, text, jar, freq: clampFreq(freq), doneWeek: 0, carriedOver: 0 };
}

export function isActiveWeekly(task: Task): boolean {
  return task.jar === 'weekly' && task.status !== 'pending';
}

/** How many more times a weekly task can be drawn this week. */
export function remaining(task: Task): number {
  if (task.paused) return 0;
  const total = (task.freq ?? 0) + (task.carriedOver ?? 0);
  return Math.max(0, total - (task.doneWeek ?? 0));
}

export function complete(
  tasks: readonly Task[],
  achievements: readonly Achievement[],
  taskId: string,
  achievement: { id: string; date: ISODate },
): { tasks: Task[]; achievements: Achievement[] } {
  const task = tasks.find((t) => t.id === taskId);
  if (!task) return { tasks: [...tasks], achievements: [...achievements] };
  const nextTasks = isActiveWeekly(task)
    ? tasks.map((t) =>
        t.id === taskId ? { ...t, doneWeek: (t.doneWeek ?? 0) + 1 } : t,
      )
    : tasks.filter((t) => t.id !== taskId);
  return {
    tasks: nextTasks,
    achievements: [
      { ...achievement, text: task.text, jar: task.jar },
      ...achievements,
    ],
  };
}

export function moveToJar(task: Task, jar: Jar): Task {
  const freq = task.jar === 'weekly' ? task.freq : undefined;
  const moved = newTask(task.id, task.text, jar, freq ?? MOVED_TASK_FREQ);
  if (task.status) moved.status = task.status;
  if (jar === 'weekly' && task.paused) moved.paused = true;
  return moved;
}

export function returnToJar(task: Task, jar: Jar): Task {
  const { status: _status, ...withoutStatus } = task;
  return jar === task.jar ? withoutStatus : moveToJar(withoutStatus, jar);
}

export function notDone(
  tasks: readonly Task[],
  taskId: string,
  choice: NotDoneChoice,
): Task[] {
  const apply = (task: Task): Task => {
    switch (choice.kind) {
      case 'return':
        return returnToJar(task, task.jar);
      case 'move':
        return returnToJar(task, choice.jar);
      case 'pending':
        return { ...task, status: 'pending' };
    }
  };
  return tasks.map((t) => (t.id === taskId ? apply(t) : t));
}
