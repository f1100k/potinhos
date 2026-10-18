import type { Jar } from '../../types/model';

type RawFile = Record<string, unknown>;

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

const withCarriedOver = (task: unknown) => {
  if (!isRecord(task) || !('extra' in task)) return task;
  const { extra, ...rest } = task;
  return { ...rest, carriedOver: extra };
};

function fromShortNames(raw: RawFile): RawFile {
  const { done, current, ...rest } = raw;
  return {
    ...rest,
    tasks: mapList(raw.tasks, withCarriedOver),
    achievements: done,
    drawn: current,
  };
}

/** `MIGRATIONS[n]` turns a version `n` file into version `n + 1`. */
const MIGRATIONS: readonly ((raw: RawFile) => RawFile)[] = [
  fromPrototype,
  fromPortuguese,
  fromShortNames,
];

export const SCHEMA_VERSION = MIGRATIONS.length;

export function versionOf(raw: RawFile): number {
  const version =
    raw.version ?? (isRecord(raw.meta) ? raw.meta.schemaVersion : undefined);
  return typeof version === 'number' &&
    Number.isInteger(version) &&
    version >= 0
    ? version
    : 0;
}

export function migrate(raw: RawFile, version: number): RawFile {
  return MIGRATIONS.slice(version).reduce((file, step) => step(file), raw);
}
