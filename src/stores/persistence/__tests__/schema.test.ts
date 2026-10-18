import { describe, expect, it } from 'vitest';
import { createInitialData } from '../../appReducer';
import { SCHEMA_VERSION } from '../migrate';
import {
  exportFile,
  exportFileName,
  InvalidDataError,
  parseData,
} from '../schema';

const now = new Date(2026, 9, 14, 10);

describe('parseData', () => {
  it('migrates the prototype format (version 0)', () => {
    const data = parseData(
      {
        tasks: [
          { id: 1, text: 'Lavar a louça', pote: 'simples' },
          { id: 9, text: 'Estudar', pote: 'semanal', freq: 2, doneWeek: 1 },
          { id: 12, text: 'Ligar', pote: 'complexas', status: 'pendente' },
        ],
        done: [{ text: 'Pagar a luz', pote: 'simples', date: '2026-10-02' }],
        current: { taskId: 9, date: '2026-10-14' },
      },
      now,
    );
    expect(data.tasks).toEqual([
      { id: '1', text: 'Lavar a louça', jar: 'simple' },
      {
        id: '9',
        text: 'Estudar',
        jar: 'weekly',
        freq: 2,
        doneWeek: 1,
        carriedOver: 0,
      },
      { id: '12', text: 'Ligar', jar: 'complex', status: 'pending' },
    ]);
    expect(data.achievements[0]).toMatchObject({
      text: 'Pagar a luz',
      jar: 'simple',
      date: '2026-10-02',
    });
    expect(data.drawn).toEqual({ taskId: '9', date: '2026-10-14' });
    expect(data.meta).toMatchObject({
      visited: true,
      weekStart: '2026-10-12',
    });
  });

  it('migrates the Portuguese format (version 1)', () => {
    const data = parseData(
      {
        version: 1,
        tasks: [
          { id: 'a', text: 'Ler', pote: 'semanal', freq: 3, doneWeek: 1 },
          { id: 'b', text: 'Ligar', pote: 'simples', status: 'pendente' },
        ],
        done: [
          { id: 'k', text: 'Pagar', pote: 'complexas', date: '2026-10-02' },
        ],
        meta: {
          schemaVersion: 1,
          visited: true,
          weekStart: '2026-10-12',
          lastWeekClosed: null,
        },
      },
      now,
    );
    expect(data.tasks).toEqual([
      {
        id: 'a',
        text: 'Ler',
        jar: 'weekly',
        freq: 3,
        doneWeek: 1,
        carriedOver: 0,
      },
      { id: 'b', text: 'Ligar', jar: 'simple', status: 'pending' },
    ]);
    expect(data.achievements).toEqual([
      { id: 'k', text: 'Pagar', jar: 'complex', date: '2026-10-02' },
    ]);
    expect(data.meta.visited).toBe(true);
  });

  it('migrates the short field names (version 2)', () => {
    const data = parseData(
      {
        version: 2,
        tasks: [
          {
            id: 'w',
            text: 'Ler',
            jar: 'weekly',
            freq: 2,
            doneWeek: 0,
            extra: 1,
          },
        ],
        done: [{ id: 'k', text: 'Pagar', jar: 'simple', date: '2026-10-02' }],
        current: { taskId: 'w', date: '2026-10-14' },
      },
      now,
    );
    expect(data.tasks[0]?.carriedOver).toBe(1);
    expect(data.achievements).toHaveLength(1);
    expect(data.drawn).toEqual({ taskId: 'w', date: '2026-10-14' });
  });

  it('does not accept older formats in the current version', () => {
    const data = parseData(
      {
        version: 3,
        tasks: [{ id: 'a', text: 'Ler', pote: 'simples' }],
        done: [{ id: 'k', text: 'Pagar', jar: 'simple', date: '2026-10-02' }],
      },
      now,
    );
    expect(data.tasks).toEqual([]);
    expect(data.achievements).toEqual([]);
  });

  it('a file without meta has not visited the landing page', () => {
    expect(parseData({ version: 3, tasks: [] }, now).meta.visited).toBe(false);
  });

  it('drops invalid items and repeated ids', () => {
    const data = parseData(
      {
        version: 3,
        tasks: [
          { id: 'a', text: 'ok', jar: 'simple' },
          { id: 'a', text: 'repetida', jar: 'simple' },
          { id: 'b', text: '', jar: 'simple' },
          { id: 'c', text: 'x', jar: 'drawer' },
          null,
        ],
        achievements: [{ text: 'sem data', jar: 'simple' }],
      },
      now,
    );
    expect(data.tasks.map((t) => t.id)).toEqual(['a']);
    expect(data.achievements).toEqual([]);
  });

  it('clamps freq and ignores a drawn task that no longer exists', () => {
    const data = parseData(
      {
        version: 3,
        tasks: [{ id: 'w', text: 'w', jar: 'weekly', freq: 40 }],
        drawn: { taskId: 'gone', date: '2026-10-14' },
      },
      now,
    );
    expect(data.tasks[0]?.freq).toBe(7);
    expect(data.drawn).toBeNull();
  });

  it('rejects a file without tasks or from a newer version', () => {
    expect(() => parseData('oi', now)).toThrow(InvalidDataError);
    expect(() => parseData({ foo: 1 }, now)).toThrow(InvalidDataError);
    expect(() => parseData({ version: 99, tasks: [] }, now)).toThrow(
      InvalidDataError,
    );
  });

  it('tells why the file was rejected', () => {
    const reasonOf = (input: unknown) => {
      try {
        parseData(input, now);
      } catch (error) {
        return error instanceof InvalidDataError ? error.reason : error;
      }
    };
    expect(reasonOf({ foo: 1 })).toBe('format');
    expect(reasonOf({ version: 99, tasks: [] })).toBe('newerVersion');
  });
});

describe('exportFile', () => {
  it('saves the current version and the export time, and reads back', () => {
    const data = {
      ...createInitialData(now),
      tasks: [{ id: 'a', text: 'Lavar a louça', jar: 'simple' as const }],
    };
    const file = JSON.parse(exportFile(data, now));
    expect(file).toMatchObject({
      version: SCHEMA_VERSION,
      exportedAt: now.toISOString(),
      tasks: data.tasks,
    });
    expect(parseData(file, now)).toEqual(data);
  });

  it('names the file with the local date', () => {
    expect(exportFileName(now)).toBe('potinhos-2026-10-14.json');
  });
});
