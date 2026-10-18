import type { AppData } from '../../../types/model';

/**
 * Adds the slips and achievements of `imported` that are not here yet.
 * Settings, the week and today's draw stay the ones of this device.
 */
export function mergeData(current: AppData, imported: AppData): AppData {
  const taskIds = new Set(current.tasks.map((t) => t.id));
  const achievementIds = new Set(current.achievements.map((a) => a.id));
  const newTasks = imported.tasks.filter((t) => !taskIds.has(t.id));
  const newAchievements = imported.achievements.filter(
    (a) => !achievementIds.has(a.id),
  );
  if (newTasks.length === 0 && newAchievements.length === 0) return current;
  return {
    ...current,
    tasks: [...current.tasks, ...newTasks],
    achievements: [...current.achievements, ...newAchievements].sort((a, b) =>
      b.date.localeCompare(a.date),
    ),
  };
}
