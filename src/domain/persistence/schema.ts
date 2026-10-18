import { z } from 'zod';
import { clampFreq } from '../rules';
import { SCHEMA_VERSION } from '../store';
import { type AppData, isoDateSchema, jarSchema, type Task } from '../types';
import { mondayOf } from '../week';
import { isRecord, migrate, versionOf } from './migrate';

const listOf = <T extends z.ZodType>(item: T) =>
  z.array(z.unknown()).transform((items) =>
    items.flatMap((v) => {
      const r = item.safeParse(v);
      return r.success ? [r.data] : [];
    }),
  );

const id = z.string().min(1);
const text = z.string().trim().min(1);
const count = z.number().nonnegative().transform(Math.floor).catch(0);

const task = z
  .object({
    id,
    text,
    jar: jarSchema,
    status: z.literal('pending').optional().catch(undefined),
    freq: count,
    doneWeek: count,
    extra: count,
    paused: z.boolean().catch(false),
  })
  .transform(({ id, text, jar, status, freq, doneWeek, extra, paused }) => {
    const t: Task = { id, text, jar };
    if (status) t.status = status;
    if (jar === 'weekly' && !status) {
      t.freq = clampFreq(freq || 1);
      t.doneWeek = doneWeek;
      t.extra = extra;
      if (paused) t.paused = true;
    }
    return t;
  });

const achievement = z.object({
  id: id.optional().catch(undefined),
  text,
  jar: jarSchema,
  date: isoDateSchema,
});

const meta = z.object({
  visited: z.boolean().catch(false),
  weekStart: isoDateSchema.optional().catch(undefined),
  lastWeekClosed: isoDateSchema.nullable().catch(null),
});

const file = z.object({
  tasks: listOf(task),
  done: listOf(achievement).catch([]),
  settings: z
    .object({ sounds: z.boolean().catch(true) })
    .catch({ sounds: true }),
  meta: meta.optional().catch(undefined),
  current: z.object({ taskId: id, date: isoDateSchema }).nullable().catch(null),
});

function dedupe<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((x) => !seen.has(x.id) && seen.add(x.id));
}

export class InvalidDataError extends Error {}

export function parseData(input: unknown, now: Date): AppData {
  if (!isRecord(input)) throw new InvalidDataError('Unrecognized format');
  const version = versionOf(input);
  if (version > SCHEMA_VERSION) {
    throw new InvalidDataError('File is from a newer version of the app');
  }
  const r = file.safeParse(migrate(input, version));
  if (!r.success) throw new InvalidDataError('Unrecognized format');
  const { tasks, done, settings, meta, current } = r.data;
  const uniqueTasks = dedupe(tasks);
  return {
    tasks: uniqueTasks,
    done: dedupe(
      done.map((a, i) => ({ ...a, id: a.id ?? `a-${a.date}-${i}` })),
    ),
    settings,
    meta: {
      schemaVersion: SCHEMA_VERSION,
      visited: meta?.visited ?? false,
      weekStart: meta?.weekStart ?? mondayOf(now),
      lastWeekClosed: meta?.lastWeekClosed ?? null,
    },
    current:
      current && uniqueTasks.some((t) => t.id === current.taskId)
        ? current
        : null,
  };
}

export function serialize(data: AppData): string {
  return JSON.stringify({ version: SCHEMA_VERSION, ...data });
}
