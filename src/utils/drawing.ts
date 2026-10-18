import type { Jar, Task } from '../types/model';
import { remaining } from './tasks';

export function drawPool(tasks: readonly Task[], jar: Jar): Task[] {
  return tasks.filter(
    (t) =>
      t.jar === jar &&
      t.status !== 'pending' &&
      (jar !== 'weekly' || remaining(t) > 0),
  );
}

export function slipCount(tasks: readonly Task[], jar: Jar): number {
  const candidates = drawPool(tasks, jar);
  if (jar !== 'weekly') return candidates.length;
  return candidates.reduce((sum, t) => sum + remaining(t), 0);
}

export function draw(
  tasks: readonly Task[],
  jar: Jar,
  random: () => number = Math.random,
): Task | null {
  const candidates = drawPool(tasks, jar);
  if (candidates.length === 0) return null;
  const index = Math.min(
    candidates.length - 1,
    Math.floor(random() * candidates.length),
  );
  return candidates[index] ?? null;
}
