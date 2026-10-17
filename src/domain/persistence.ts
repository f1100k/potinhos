import { createInitialData, SCHEMA_VERSION } from './store';
import {
  type AppData,
  type Conquista,
  type ISODate,
  MAX_FREQ,
  type Meta,
  MIN_FREQ,
  POTES,
  type Pote,
  type Sorteada,
  type Task,
} from './types';
import { mondayOf } from './week';

export const STORAGE_KEY = 'potinhos';
export const CORRUPT_KEY = 'potinhos:corrompido';

type Raw = Record<string, unknown>;

const isObj = (v: unknown): v is Raw =>
  typeof v === 'object' && v !== null && !Array.isArray(v);
const isPote = (v: unknown): v is Pote =>
  typeof v === 'string' && (POTES as readonly string[]).includes(v);
const isDate = (v: unknown): v is ISODate =>
  typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v);
const asId = (v: unknown): string | null =>
  typeof v === 'string' && v
    ? v
    : typeof v === 'number' && Number.isFinite(v)
      ? String(v)
      : null;
const asCount = (v: unknown): number =>
  typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;

function parseTask(v: unknown): Task | null {
  if (!isObj(v)) return null;
  const id = asId(v.id);
  const text = typeof v.text === 'string' ? v.text.trim() : '';
  if (!id || !text || !isPote(v.pote)) return null;
  const t: Task = { id, text, pote: v.pote };
  if (v.status === 'pendente') t.status = 'pendente';
  if (v.pote === 'semanal' && t.status !== 'pendente') {
    const freq = asCount(v.freq);
    t.freq = Math.min(MAX_FREQ, Math.max(MIN_FREQ, freq || 1));
    t.doneWeek = asCount(v.doneWeek);
    t.extra = asCount(v.extra);
    if (v.paused === true) t.paused = true;
  }
  return t;
}

function parseConquista(v: unknown, i: number): Conquista | null {
  if (!isObj(v)) return null;
  const text = typeof v.text === 'string' ? v.text.trim() : '';
  if (!text || !isPote(v.pote) || !isDate(v.date)) return null;
  return {
    id: asId(v.id) ?? `c-${v.date}-${i}`,
    text,
    pote: v.pote,
    date: v.date,
  };
}

function parseMeta(v: unknown, now: Date): Meta {
  const m = isObj(v) ? v : {};
  return {
    schemaVersion: SCHEMA_VERSION,
    visited: m.visited === true,
    weekStart: isDate(m.weekStart) ? m.weekStart : mondayOf(now),
    lastWeekClosed: isDate(m.lastWeekClosed) ? m.lastWeekClosed : null,
  };
}

function parseCurrent(v: unknown, tasks: readonly Task[]): Sorteada | null {
  if (!isObj(v)) return null;
  const taskId = asId(v.taskId);
  if (!taskId || !isDate(v.date)) return null;
  if (!tasks.some((t) => t.id === taskId)) return null;
  return { taskId, date: v.date };
}

function dedupe<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((x) => !seen.has(x.id) && seen.add(x.id));
}

/**
 * Migra versões antigas para a atual. A versão 0 é o formato do
 * protótipo: ids numéricos e sem `meta`. Os campos são normalizados em
 * `parseData`, então aqui só entra o que muda de forma.
 */
function migrate(raw: Raw): Raw {
  const version =
    typeof raw.version === 'number'
      ? raw.version
      : isObj(raw.meta) && typeof raw.meta.schemaVersion === 'number'
        ? raw.meta.schemaVersion
        : 0;
  let r = raw;
  if (version < 1) {
    r = { ...r, meta: isObj(r.meta) ? r.meta : { visited: true } };
  }
  return r;
}

export class InvalidDataError extends Error {}

/**
 * Lê dados salvos ou importados, valida e migra. Itens inválidos são
 * descartados; um arquivo sem a forma esperada lança `InvalidDataError`.
 */
export function parseData(input: unknown, now: Date): AppData {
  if (!isObj(input) || !Array.isArray(input.tasks)) {
    throw new InvalidDataError('Formato não reconhecido');
  }
  const version = typeof input.version === 'number' ? input.version : 0;
  if (version > SCHEMA_VERSION) {
    throw new InvalidDataError('Arquivo de uma versão mais nova do app');
  }
  const raw = migrate(input);
  const tasks = dedupe(
    (raw.tasks as unknown[]).map(parseTask).filter((t) => t !== null),
  );
  const done = dedupe(
    (Array.isArray(raw.done) ? raw.done : [])
      .map(parseConquista)
      .filter((c) => c !== null),
  );
  const settings = isObj(raw.settings) ? raw.settings : {};
  return {
    tasks,
    done,
    settings: { sounds: settings.sounds !== false },
    meta: parseMeta(raw.meta, now),
    current: parseCurrent(raw.current, tasks),
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
