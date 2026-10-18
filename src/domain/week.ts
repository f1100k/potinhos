import { isFriday, isWeekend, startOfWeek } from 'date-fns';
import { addDays, toISODate } from './dates';
import type { ISODate, Meta } from './types';

export function mondayOf(now: Date): ISODate {
  return toISODate(startOfWeek(now, { weekStartsOn: 1 }));
}

export function sundayOf(weekStart: ISODate): ISODate {
  return addDays(weekStart, 6);
}

export function isWeekOverdue(meta: Meta, now: Date): boolean {
  return mondayOf(now) > meta.weekStart;
}

export const WEEKEND_CARD_HOUR = 18;

export function isWeekEnding(meta: Meta, now: Date): boolean {
  if (meta.weekStart !== mondayOf(now)) return false;
  if (isWeekend(now)) return true;
  return isFriday(now) && now.getHours() >= WEEKEND_CARD_HOUR;
}

/**
 * Closing an overdue week starts the current one; closing early (on the
 * weekend) starts next Monday.
 */
export function nextWeekStart(meta: Meta, now: Date): ISODate {
  const current = mondayOf(now);
  return isWeekOverdue(meta, now) ? current : addDays(current, 7);
}

export function closeWeekMeta(meta: Meta, now: Date): Meta {
  return {
    ...meta,
    lastWeekClosed: meta.weekStart,
    weekStart: nextWeekStart(meta, now),
  };
}
