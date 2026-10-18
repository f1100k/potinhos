import { addDays as addDaysToDate, format, parseISO } from 'date-fns';
import type { ISODate } from './types';

/** Local date, not UTC. */
export function toISODate(d: Date): ISODate {
  return format(d, 'yyyy-MM-dd');
}

export function fromISODate(iso: ISODate): Date {
  return parseISO(iso);
}

export function addDays(iso: ISODate, days: number): ISODate {
  return toISODate(addDaysToDate(parseISO(iso), days));
}
