import { drawnToday } from '../../../stores/appReducer';
import type { AppData, Jar } from '../../../types/model';
import { draw } from '../../../utils/drawing';

type JarPick =
  | { kind: 'alreadyDrawn' }
  | { kind: 'empty' }
  | { kind: 'draw'; taskId: string };

/** There is no drawing again: while today's slip is open, every jar leads to it. */
export function pickJar(
  data: AppData,
  jar: Jar,
  now: Date,
  random: () => number = Math.random,
): JarPick {
  if (drawnToday(data, now)) return { kind: 'alreadyDrawn' };
  const task = draw(data.tasks, jar, random);
  return task ? { kind: 'draw', taskId: task.id } : { kind: 'empty' };
}
