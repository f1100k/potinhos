import type { Jar } from '../types';

export type RawFile = Record<string, unknown>;

export const isRecord = (v: unknown): v is RawFile =>
  typeof v === 'object' && v !== null && !Array.isArray(v);

const mapList = (v: unknown, fn: (item: unknown) => unknown) =>
  Array.isArray(v) ? v.map(fn) : v;

const stringId = (item: unknown) =>
  isRecord(item) && typeof item.id === 'number'
    ? { ...item, id: String(item.id) }
    : item;

// The prototype used numeric ids and had no `meta`. Anyone with data in it
// had already gone past the landing page.
function fromPrototype(raw: RawFile): RawFile {
  return {
    ...raw,
    tasks: mapList(raw.tasks, stringId),
    done: mapList(raw.done, stringId),
    current:
      isRecord(raw.current) && typeof raw.current.taskId === 'number'
        ? { ...raw.current, taskId: String(raw.current.taskId) }
        : raw.current,
    meta: raw.meta ?? { visited: true },
  };
}

const LEGACY_JARS: Record<string, Jar> = {
  simples: 'simple',
  complexas: 'complex',
  semanal: 'weekly',
};

const toEnglish = (item: unknown) => {
  if (!isRecord(item)) return item;
  const { pote, ...rest } = item;
  return {
    ...rest,
    jar: typeof pote === 'string' ? (LEGACY_JARS[pote] ?? pote) : pote,
    ...(rest.status === 'pendente' ? { status: 'pending' } : {}),
  };
};

function fromPortuguese(raw: RawFile): RawFile {
  return {
    ...raw,
    tasks: mapList(raw.tasks, toEnglish),
    done: mapList(raw.done, toEnglish),
  };
}

/** `MIGRATIONS[n]` turns a version `n` file into version `n + 1`. */
export const MIGRATIONS: readonly ((raw: RawFile) => RawFile)[] = [
  fromPrototype,
  fromPortuguese,
];

export function versionOf(raw: RawFile): number {
  const v =
    raw.version ?? (isRecord(raw.meta) ? raw.meta.schemaVersion : undefined);
  return typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : 0;
}

export function migrate(raw: RawFile, version: number): RawFile {
  return MIGRATIONS.slice(version).reduce((r, step) => step(r), raw);
}
