import { describe, expect, it } from 'vitest';
import { InvalidDataError, parseData } from './schema';

const now = new Date(2026, 9, 14, 10);

describe('parseData', () => {
  it('migrates the prototype format (version 0)', () => {
    const d = parseData(
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
    expect(d.tasks).toEqual([
      { id: '1', text: 'Lavar a louça', jar: 'simple' },
      {
        id: '9',
        text: 'Estudar',
        jar: 'weekly',
        freq: 2,
        doneWeek: 1,
        extra: 0,
      },
      { id: '12', text: 'Ligar', jar: 'complex', status: 'pending' },
    ]);
    expect(d.done[0]).toMatchObject({
      text: 'Pagar a luz',
      jar: 'simple',
      date: '2026-10-02',
    });
    expect(d.current).toEqual({ taskId: '9', date: '2026-10-14' });
    expect(d.meta).toMatchObject({
      schemaVersion: 2,
      visited: true,
      weekStart: '2026-10-12',
    });
  });

  it('migrates the Portuguese format (version 1)', () => {
    const d = parseData(
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
    expect(d.tasks).toEqual([
      { id: 'a', text: 'Ler', jar: 'weekly', freq: 3, doneWeek: 1, extra: 0 },
      { id: 'b', text: 'Ligar', jar: 'simple', status: 'pending' },
    ]);
    expect(d.done).toEqual([
      { id: 'k', text: 'Pagar', jar: 'complex', date: '2026-10-02' },
    ]);
    expect(d.meta).toMatchObject({ schemaVersion: 2, visited: true });
  });

  it('does not accept the Portuguese format in version 2', () => {
    const d = parseData(
      { version: 2, tasks: [{ id: 'a', text: 'Ler', pote: 'simples' }] },
      now,
    );
    expect(d.tasks).toEqual([]);
  });

  it('a file without meta has not visited the landing page', () => {
    expect(parseData({ version: 2, tasks: [] }, now).meta.visited).toBe(false);
  });

  it('drops invalid items and repeated ids', () => {
    const d = parseData(
      {
        version: 2,
        tasks: [
          { id: 'a', text: 'ok', jar: 'simple' },
          { id: 'a', text: 'repetida', jar: 'simple' },
          { id: 'b', text: '', jar: 'simple' },
          { id: 'c', text: 'x', jar: 'drawer' },
          null,
        ],
        done: [{ text: 'sem data', jar: 'simple' }],
      },
      now,
    );
    expect(d.tasks.map((t) => t.id)).toEqual(['a']);
    expect(d.done).toEqual([]);
  });

  it('clamps freq and ignores a drawn task that no longer exists', () => {
    const d = parseData(
      {
        version: 2,
        tasks: [{ id: 'w', text: 'w', jar: 'weekly', freq: 40 }],
        current: { taskId: 'gone', date: '2026-10-14' },
      },
      now,
    );
    expect(d.tasks[0]?.freq).toBe(7);
    expect(d.current).toBeNull();
  });

  it('rejects a file without tasks or from a newer version', () => {
    expect(() => parseData('oi', now)).toThrow(InvalidDataError);
    expect(() => parseData({ foo: 1 }, now)).toThrow(InvalidDataError);
    expect(() => parseData({ version: 99, tasks: [] }, now)).toThrow(
      InvalidDataError,
    );
  });
});
