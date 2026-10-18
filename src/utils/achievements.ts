import type { Achievement, ISODate } from '../types/model';
import { toISODate } from './dates';
import { sundayOf } from './week';

export function achievementsOfWeek(
  achievements: readonly Achievement[],
  weekStart: ISODate,
): Achievement[] {
  const weekEnd = sundayOf(weekStart);
  return achievements.filter((a) => a.date >= weekStart && a.date <= weekEnd);
}

export function achievementsOfMonth(
  achievements: readonly Achievement[],
  now: Date,
): Achievement[] {
  const month = toISODate(now).slice(0, 7);
  return achievements.filter((a) => a.date.startsWith(month));
}
