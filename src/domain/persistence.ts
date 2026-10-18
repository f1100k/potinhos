import { z } from 'zod';
import { createInitialData, SCHEMA_VERSION } from './store';
import {
  type AppData,
  isoDateSchema,
  type Jar,
  jarSchema,
  MAX_FREQ,
  MIN_FREQ,
  type Task,
} from './types';
import { mondayOf } from './week';

export const STORAGE_KEY = 'potinhos';
export const CORRUPT_KEY = 'potinhos:corrupted';

const listOf = <T extends z.ZodType>(item: T) =>
  z.array(z.unknown()).transform((items) =>
    items.flatMap((v) => {
      const r = item.safeParse(v);
      return r.success ? [r.data] : [];
    }),
  );

// Up to version 1 the data was in Portuguese: a `pote` field with
// 'simples' | 'complexas' | 'semanal', and status 'pendente'.
const LEGACY_JARS: Record<string, Jar> = {
  simples: 'simple',
  complexas: 'complex',
  semanal: 'weekly',
};

const withLegacyJar = (v: unknown) =>
  typeof v === 'object' && v !== null && 'pote' in v && !('jar' in v)
    ? { ...v, jar: v.pote }
    : v;

const jar = z
  .string()
  .transform((v) => LEGACY_JARS[v] ?? v)
  .pipe(jarSchema);

// In the prototype, ids were numbers.
const id = z.union([z.string().min(1), z.number().transform(String)]);
const text = z.string().trim().min(1);
const count = z.number().nonnegative().transform(Math.floor).catch(0);

const task = z.preprocess(
  withLegacyJar,
  z
    .object({
      id,
      text,
      jar,
      status: z
        .enum(['pending', 'pendente'])
        .transform(() => 'pending' as const)
        .optional()
        .catch(undefined),
      freq: count,
      doneWeek: count,
      extra: count,
      paused: z.boolean().catch(false),
    })
    .transform(({ id, text, jar, status, freq, doneWeek, extra, paused }) => {
      const t: Task = { id, text, jar };
      if (status) t.status = status;
      if (jar === 'weekly' && !status) {
        t.freq = Math.min(MAX_FREQ, Math.max(MIN_FREQ, freq || 1));
        t.doneWeek = doneWeek;
        t.extra = extra;
        if (paused) t.paused = true;
      }
      return t;
    }),
);

const achievement = z.preprocess(
  withLegacyJar,
  z.object({
    id: id.optional().catch(undefined),
    text,
    jar,
    date: isoDateSchema,
  }),
);

const meta = z.object({
  schemaVersion: z.number().optional().catch(undefined),
  visited: z.boolean().catch(false),
  weekStart: isoDateSchema.optional().catch(undefined),
  lastWeekClosed: isoDateSchema.nullable().catch(null),
});

const file = z.object({
  version: z.number().optional().catch(undefined),
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

/**
 * Version 0 is the prototype format, with no `meta`; anyone with data in
 * it had already gone past the landing page.
 */
export function parseData(input: unknown, now: Date): AppData {
  const r = file.safeParse(input);
  if (!r.success) throw new InvalidDataError('Unrecognized format');
  const { tasks, done, settings, meta, current } = r.data;
  const version = r.data.version ?? meta?.schemaVersion ?? 0;
  if (version > SCHEMA_VERSION) {
    throw new InvalidDataError('File is from a newer version of the app');
  }
  const uniqueTasks = dedupe(tasks);
  return {
    tasks: uniqueTasks,
    done: dedupe(
      done.map((a, i) => ({ ...a, id: a.id ?? `a-${a.date}-${i}` })),
    ),
    settings,
    meta: {
      schemaVersion: SCHEMA_VERSION,
      visited: meta ? meta.visited : version < 1,
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

export function loadData(storage: Storage | undefined, now: Date): AppData {
  let raw: string | null = null;
  try {
    raw = storage?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return createInitialData(now);
  }
  if (raw === null) return createInitialData(now);
  try {
    return parseData(JSON.parse(raw), now);
  } catch {
    try {
      storage?.setItem(CORRUPT_KEY, raw);
    } catch {}
    return createInitialData(now);
  }
}

export function saveData(storage: Storage | undefined, data: AppData): void {
  try {
    storage?.setItem(STORAGE_KEY, serialize(data));
  } catch {
    // Private mode or full quota: the app keeps working in memory.
  }
}

export function clearData(storage: Storage | undefined): void {
  try {
    storage?.removeItem(STORAGE_KEY);
    storage?.removeItem(CORRUPT_KEY);
  } catch {}
}
