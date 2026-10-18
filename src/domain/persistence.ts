import { z } from 'zod';
import { createInitialData, SCHEMA_VERSION } from './store';
import {
  type AppData,
  isoDateSchema,
  MAX_FREQ,
  MIN_FREQ,
  poteSchema,
  type Task,
} from './types';
import { mondayOf } from './week';

export const STORAGE_KEY = 'potinhos';
export const CORRUPT_KEY = 'potinhos:corrompido';

/** Lista em que um item inválido é descartado, sem invalidar o resto. */
const listaDe = <T extends z.ZodType>(item: T) =>
  z.array(z.unknown()).transform((itens) =>
    itens.flatMap((v) => {
      const r = item.safeParse(v);
      return r.success ? [r.data] : [];
    }),
  );

// No protótipo os ids eram números.
const id = z.union([z.string().min(1), z.number().transform(String)]);
const texto = z.string().trim().min(1);
const contagem = z.number().nonnegative().transform(Math.floor).catch(0);

const task = z
  .object({
    id,
    text: texto,
    pote: poteSchema,
    status: z.literal('pendente').optional().catch(undefined),
    freq: contagem,
    doneWeek: contagem,
    extra: contagem,
    paused: z.boolean().catch(false),
  })
  .transform(({ id, text, pote, status, freq, doneWeek, extra, paused }) => {
    const t: Task = { id, text, pote };
    if (status) t.status = status;
    // Só a semanal ativa guarda as contagens da semana.
    if (pote === 'semanal' && !status) {
      t.freq = Math.min(MAX_FREQ, Math.max(MIN_FREQ, freq || 1));
      t.doneWeek = doneWeek;
      t.extra = extra;
      if (paused) t.paused = true;
    }
    return t;
  });

const conquista = z.object({
  id: id.optional().catch(undefined),
  text: texto,
  pote: poteSchema,
  date: isoDateSchema,
});

const meta = z.object({
  schemaVersion: z.number().optional().catch(undefined),
  visited: z.boolean().catch(false),
  weekStart: isoDateSchema.optional().catch(undefined),
  lastWeekClosed: isoDateSchema.nullable().catch(null),
});

const arquivo = z.object({
  version: z.number().optional().catch(undefined),
  tasks: listaDe(task),
  done: listaDe(conquista).catch([]),
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
 * Lê dados salvos ou importados, valida e migra. Itens inválidos são
 * descartados; um arquivo sem a forma esperada lança `InvalidDataError`.
 *
 * A versão 0 é o formato do protótipo: ids numéricos e sem `meta`. Quem
 * tinha dados nele já tinha passado pela landing.
 */
export function parseData(input: unknown, now: Date): AppData {
  const r = arquivo.safeParse(input);
  if (!r.success) throw new InvalidDataError('Formato não reconhecido');
  const { tasks, done, settings, meta, current } = r.data;
  const version = r.data.version ?? meta?.schemaVersion ?? 0;
  if (version > SCHEMA_VERSION) {
    throw new InvalidDataError('Arquivo de uma versão mais nova do app');
  }
  const unicas = dedupe(tasks);
  return {
    tasks: unicas,
    done: dedupe(
      done.map((c, i) => ({ ...c, id: c.id ?? `c-${c.date}-${i}` })),
    ),
    settings,
    meta: {
      schemaVersion: SCHEMA_VERSION,
      visited: meta ? meta.visited : version < 1,
      weekStart: meta?.weekStart ?? mondayOf(now),
      lastWeekClosed: meta?.lastWeekClosed ?? null,
    },
    current:
      current && unicas.some((t) => t.id === current.taskId) ? current : null,
  };
}

export function serialize(data: AppData): string {
  return JSON.stringify({ version: SCHEMA_VERSION, ...data });
}

/**
 * Carrega do `localStorage`. JSON corrompido não quebra o app: o
 * conteúdo é guardado à parte e o app recomeça vazio.
 */
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
    } catch {
      // Sem espaço ou sem acesso: segue sem a cópia.
    }
    return createInitialData(now);
  }
}

export function saveData(storage: Storage | undefined, data: AppData): void {
  try {
    storage?.setItem(STORAGE_KEY, serialize(data));
  } catch {
    // Modo privado ou cota cheia: o app continua funcionando na memória.
  }
}

export function clearData(storage: Storage | undefined): void {
  try {
    storage?.removeItem(STORAGE_KEY);
    storage?.removeItem(CORRUPT_KEY);
  } catch {
    // Nada a fazer.
  }
}
