import { isFriday, isWeekend, startOfWeek } from 'date-fns';
import type { ISODate, Meta, Task, WeekDecision } from '../types/model';
import { addDays, toISODate } from './dates';
import { slipCount } from './drawing';
import { isActiveWeekly, remaining } from './tasks';

const WEEK_ENDING_HOUR = 18;

export function mondayOf(now: Date): ISODate {
  return toISODate(startOfWeek(now, { weekStartsOn: 1 }));
}

export function sundayOf(weekStart: ISODate): ISODate {
  return addDays(weekStart, 6);
}

export function isWeekOverdue(meta: Meta, now: Date): boolean {
  return mondayOf(now) > meta.weekStart;
}

export function isWeekEnding(meta: Meta, now: Date): boolean {
  if (meta.weekStart !== mondayOf(now)) return false;
  if (isWeekend(now)) return true;
  return isFriday(now) && now.getHours() >= WEEK_ENDING_HOUR;
}

/**
 * Closing an overdue week starts the current one; closing early (on the
 * weekend) starts next Monday.
 */
function nextWeekStart(meta: Meta, now: Date): ISODate {
  const thisMonday = mondayOf(now);
  return isWeekOverdue(meta, now) ? thisMonday : addDays(thisMonday, 7);
}

export function closeWeekMeta(meta: Meta, now: Date): Meta {
  return {
    ...meta,
    lastWeekClosed: meta.weekStart,
    weekStart: nextWeekStart(meta, now),
  };
}

export function isWeekComplete(tasks: readonly Task[]): boolean {
  return slipCount(tasks, 'weekly') === 0 && tasks.some(isActiveWeekly);
}

export function leftovers(tasks: readonly Task[]): Task[] {
  return tasks.filter((t) => isActiveWeekly(t) && remaining(t) > 0);
}

export function closeWeek(
  tasks: readonly Task[],
  decisions: Readonly<Record<string, WeekDecision>>,
  newId: () => string,
): Task[] {
  const pendingCopies: Task[] = [];
  const closed = tasks.map((task) => {
    if (!isActiveWeekly(task)) return task;
    const left = remaining(task);
    const decision = decisions[task.id] ?? 'carry';
    if (left > 0 && decision === 'pending') {
      pendingCopies.push({
        id: newId(),
        text: task.text,
        jar: 'weekly',
        status: 'pending',
      });
    }
    const carriedOver = left > 0 && decision === 'carry' ? left : 0;
    return { ...task, doneWeek: 0, carriedOver };
  });
  return [...closed, ...pendingCopies];
}
