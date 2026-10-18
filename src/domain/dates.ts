import { format, parseISO, addDays as somarDias } from 'date-fns';
import type { ISODate } from './types';

/** Data local (não UTC) no formato `YYYY-MM-DD`. */
export function toISODate(d: Date): ISODate {
  return format(d, 'yyyy-MM-dd');
}

/** Início do dia local da data. */
export function fromISODate(iso: ISODate): Date {
  return parseISO(iso);
}

export function addDays(iso: ISODate, days: number): ISODate {
  return toISODate(somarDias(parseISO(iso), days));
}
