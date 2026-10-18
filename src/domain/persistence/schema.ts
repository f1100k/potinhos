import { z } from 'zod';
import { clampFreq } from '../tasks';
import { type AppData, isoDateSchema, jarSchema, type Task } from '../types';
import { mondayOf } from '../week';
import { isRecord, migrate, SCHEMA_VERSION, versionOf } from './migrate';

const lenientListOf = <T extends z.ZodType>(itemSchema: T) =>
  z.array(z.unknown()).transform((items) =>
    items.flatMap((item) => {
      const result = itemSchema.safeParse(item);
      return result.success ? [result.data] : [];
    }),
  );

const idSchema = z.string().min(1);
const textSchema = z.string().trim().min(1);
const timesSchema = z.number().nonnegative().transform(Math.floor).catch(0);

const taskSchema = z
  .object({
    id: idSchema,
    text: textSchema,
    jar: jarSchema,
    status: z.literal('pending').optional().catch(undefined),
    freq: timesSchema,
    doneWeek: timesSchema,
    carriedOver: timesSchema,
    paused: z.boolean().catch(false),
  })
  .transform(
    ({ id, text, jar, status, freq, doneWeek, carriedOver, paused }) => {
      const task: Task = { id, text, jar };
      if (status) task.status = status;
      if (jar === 'weekly' && !status) {
        task.freq = clampFreq(freq || 1);
        task.doneWeek = doneWeek;
        task.carriedOver = carriedOver;
        if (paused) task.paused = true;
      }
      return task;
    },
  );

const achievementSchema = z.object({
  id: idSchema.optional().catch(undefined),
  text: textSchema,
  jar: jarSchema,
  date: isoDateSchema,
});

const metaSchema = z.object({
  visited: z.boolean().catch(false),
  weekStart: isoDateSchema.optional().catch(undefined),
  lastWeekClosed: isoDateSchema.nullable().catch(null),
});

const fileSchema = z.object({
  tasks: lenientListOf(taskSchema),
  achievements: lenientListOf(achievementSchema).catch([]),
  settings: z
    .object({ sounds: z.boolean().catch(true) })
    .catch({ sounds: true }),
  meta: metaSchema.optional().catch(undefined),
  drawn: z
    .object({ taskId: idSchema, date: isoDateSchema })
    .nullable()
    .catch(null),
});

function dedupe<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => !seen.has(item.id) && seen.add(item.id));
}

export class InvalidDataError extends Error {}

export function parseData(input: unknown, now: Date): AppData {
  if (!isRecord(input)) throw new InvalidDataError('Unrecognized format');
  const version = versionOf(input);
  if (version > SCHEMA_VERSION) {
    throw new InvalidDataError('File is from a newer version of the app');
  }
  const result = fileSchema.safeParse(migrate(input, version));
  if (!result.success) throw new InvalidDataError('Unrecognized format');
  const { tasks, achievements, settings, meta, drawn } = result.data;
  const uniqueTasks = dedupe(tasks);
  return {
    tasks: uniqueTasks,
    achievements: dedupe(
      achievements.map((a, i) => ({ ...a, id: a.id ?? `a-${a.date}-${i}` })),
    ),
    settings,
    meta: {
      visited: meta?.visited ?? false,
      weekStart: meta?.weekStart ?? mondayOf(now),
      lastWeekClosed: meta?.lastWeekClosed ?? null,
    },
    drawn:
      drawn && uniqueTasks.some((t) => t.id === drawn.taskId) ? drawn : null,
  };
}

export function serialize(data: AppData): string {
  return JSON.stringify({ version: SCHEMA_VERSION, ...data });
}
