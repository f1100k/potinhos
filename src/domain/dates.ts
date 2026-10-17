import type { ISODate } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

/** Data local (não UTC) no formato `YYYY-MM-DD`. */
export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Meio-dia local da data, para evitar surpresas com horário de verão. */
export function fromISODate(iso: ISODate): Date {
  const [y = 1970, m = 1, d = 1] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = fromISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}
