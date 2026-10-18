import { consumeWeekendAsk } from '../../../stores/session';
import type { AppData } from '../../../types/model';
import { isWeekOverdue, leftovers } from '../../../utils/week';

type WeekTurn = 'none' | 'autoClose' | 'askWeekend';

export function weekTurn(data: AppData, now: Date): WeekTurn {
  if (!isWeekOverdue(data.meta, now)) return 'none';
  if (leftovers(data.tasks).length === 0) return 'autoClose';
  return consumeWeekendAsk() ? 'askWeekend' : 'none';
}
