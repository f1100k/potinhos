import type { Achievement, ISODate, Jar, Task } from './types';

export function remaining(t: Task): number {
  if (t.paused) return 0;
  return Math.max(0, (t.freq ?? 0) + (t.extra ?? 0) - (t.doneWeek ?? 0));
}

export function pool(tasks: readonly Task[], jar: Jar): Task[] {
  return tasks.filter(
    (t) =>
      t.jar === jar &&
      t.status !== 'pending' &&
      (jar !== 'weekly' || remaining(t) > 0),
  );
}

export function count(tasks: readonly Task[], jar: Jar): number {
  const p = pool(tasks, jar);
  if (jar !== 'weekly') return p.length;
  return p.reduce((sum, t) => sum + remaining(t), 0);
}

export function draw(
  tasks: readonly Task[],
  jar: Jar,
  random: () => number = Math.random,
): Task | null {
  const p = pool(tasks, jar);
  if (p.length === 0) return null;
  const i = Math.min(p.length - 1, Math.floor(random() * p.length));
  return p[i] ?? null;
}

export function isWeekComplete(tasks: readonly Task[]): boolean {
  return (
    count(tasks, 'weekly') === 0 &&
    tasks.some((t) => t.jar === 'weekly' && t.status !== 'pending')
  );
}

export function complete(
  tasks: readonly Task[],
  done: readonly Achievement[],
  taskId: string,
  achievement: { id: string; date: ISODate },
): { tasks: Task[]; done: Achievement[] } {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return { tasks: [...tasks], done: [...done] };
  const stays = t.jar === 'weekly' && t.status !== 'pending';
  const nextTasks = stays
    ? tasks.map((x) =>
        x.id === taskId ? { ...x, doneWeek: (x.doneWeek ?? 0) + 1 } : x,
      )
    : tasks.filter((x) => x.id !== taskId);
  return {
    tasks: nextTasks,
    done: [{ ...achievement, text: t.text, jar: t.jar }, ...done],
  };
}

export function moveToJar(t: Task, jar: Jar): Task {
  const base: Task = { id: t.id, text: t.text, jar };
  if (t.status) base.status = t.status;
  if (jar !== 'weekly') return base;
  return {
    ...base,
    freq: t.jar === 'weekly' ? (t.freq ?? 1) : 1,
    doneWeek: 0,
    extra: 0,
    ...(t.paused ? { paused: true } : {}),
  };
}

export function returnToJar(t: Task, jar: Jar): Task {
  const { status: _status, ...withoutStatus } = t;
  return jar === t.jar ? withoutStatus : moveToJar(withoutStatus, jar);
}

export type NotDoneChoice =
  | { kind: 'return' }
  | { kind: 'move'; jar: Jar }
  | { kind: 'pending' };

export function notDone(
  tasks: readonly Task[],
  taskId: string,
  choice: NotDoneChoice,
): Task[] {
  const apply = (t: Task): Task => {
    switch (choice.kind) {
      case 'return':
        return returnToJar(t, t.jar);
      case 'move':
        return returnToJar(t, choice.jar);
      case 'pending':
        return { ...t, status: 'pending' };
    }
  };
  return tasks.map((t) => (t.id === taskId ? apply(t) : t));
}

export type WeekDecision = 'carry' | 'pending' | 'drop';

export function leftovers(tasks: readonly Task[]): Task[] {
  return tasks.filter(
    (t) => t.jar === 'weekly' && t.status !== 'pending' && remaining(t) > 0,
  );
}

export function closeWeek(
  tasks: readonly Task[],
  decisions: Readonly<Record<string, WeekDecision>>,
  newId: () => string,
): Task[] {
  const copies: Task[] = [];
  const closed = tasks.map((t) => {
    if (t.jar !== 'weekly' || t.status === 'pending') return t;
    const r = remaining(t);
    const d = decisions[t.id] ?? 'carry';
    if (r > 0 && d === 'pending') {
      copies.push({
        id: newId(),
        text: t.text,
        jar: 'weekly',
        status: 'pending',
      });
    }
    return { ...t, doneWeek: 0, extra: r > 0 && d === 'carry' ? r : 0 };
  });
  return [...closed, ...copies];
}
