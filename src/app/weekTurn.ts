import type { AppData } from '../domain/types';
import { isWeekOverdue, leftovers } from '../domain/week';

type WeekTurn = 'none' | 'autoClose' | 'askWeekend';

// The weekend screen opens by itself once per session. After "Depois", the
// home card is enough: insisting would go against the product.
let weekendAsked = false;

export function weekTurn(data: AppData, now: Date): WeekTurn {
  if (!isWeekOverdue(data.meta, now)) return 'none';
  if (leftovers(data.tasks).length === 0) return 'autoClose';
  if (weekendAsked) return 'none';
  weekendAsked = true;
  return 'askWeekend';
}

export function resetWeekendAsked(): void {
  weekendAsked = false;
}
