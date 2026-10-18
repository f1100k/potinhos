import { fromISODate } from '../domain/dates';
import type { ISODate } from '../domain/types';

const LONG_DATE = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const SHORT_DATE = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
});

export function longDateLabel(date: Date): string {
  const label = LONG_DATE.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function shortDateLabel(date: ISODate): string {
  return SHORT_DATE.format(fromISODate(date));
}
