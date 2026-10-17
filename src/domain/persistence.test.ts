import { beforeEach, describe, expect, it } from 'vitest';
import {
  CORRUPT_KEY,
  InvalidDataError,
  loadData,
  parseData,
  STORAGE_KEY,
  saveData,
} from './persistence';
import { appReducer, createInitialData } from './store';

const now = new Date(2026, 9, 14, 10);

describe('persistência', () => {
  beforeEach(() => localStorage.clear());

  it('sem nada salvo, começa do zero', () => {
    expect(loadData(localStorage, now)).toEqual(createInitialData(now));
  });

  it('salva e carrega o mesmo estado', () => {
    const data = appReducer(createInitialData(now), {
      type: 'addTask',
      id: 'a',
      text: 'Regar as plantas',
      pote: 'semanal',
      freq: 2,
    });
    saveData(localStorage, data);
    expect(loadData(localStorage, now)).toEqual(data);
  });

  it('JSON corrompido não quebra e guarda uma cópia', () => {
    localStorage.setItem(STORAGE_KEY, '{"tasks": [');
    expect(loadData(localStorage, now)).toEqual(createInitialData(now));
    expect(localStorage.getItem(CORRUPT_KEY)).toBe('{"tasks": [');
  });

  it('formato estranho também volta ao zero', () => {
    localStorage.setItem(STORAGE_KEY, '"oi"');
    expect(loadData(localStorage, now).tasks).toEqual([]);
  });
});

describe('parseData', () => {
  it('migra o formato do protótipo (versão 0)', () => {
    const d = parseData(
      {
        tasks: [
          { id: 1, text: 'Lavar a louça', pote: 'simples' },
          { id: 9, text: 'Estudar', pote: 'semanal', freq: 2, doneWeek: 1 },
          { id: 12, text: 'Ligar', pote: 'complexas', status: 'pendente' },
        ],
        done: [{ text: 'Pagar a luz', pote: 'simples', date: '2026-10-02' }],
      },
      now,
    );
    expect(d.tasks).toEqual([
      { id: '1', text: 'Lavar a louça', pote: 'simples' },
      {
        id: '9',
        text: 'Estudar',
        pote: 'semanal',
        freq: 2,
        doneWeek: 1,
        extra: 0,
      },
      { id: '12', text: 'Ligar', pote: 'complexas', status: 'pendente' },
    ]);
    expect(d.done[0]).toMatchObject({
      text: 'Pagar a luz',
      date: '2026-10-02',
    });
    expect(d.meta).toMatchObject({
      schemaVersion: 1,
      visited: true,
      weekStart: '2026-10-12',
    });
  });

  it('descarta itens inválidos e ids repetidos', () => {
    const d = parseData(
      {
        version: 1,
        tasks: [
          { id: 'a', text: 'ok', pote: 'simples' },
          { id: 'a', text: 'repetida', pote: 'simples' },
          { id: 'b', text: '', pote: 'simples' },
          { id: 'c', text: 'x', pote: 'gaveta' },
          null,
        ],
        done: [{ text: 'sem data', pote: 'simples' }],
      },
      now,
    );
    expect(d.tasks.map((t) => t.id)).toEqual(['a']);
    expect(d.done).toEqual([]);
  });

  it('limita freq e ignora sorteada que não existe', () => {
    const d = parseData(
      {
        version: 1,
        tasks: [{ id: 'w', text: 'w', pote: 'semanal', freq: 40 }],
        current: { taskId: 'sumiu', date: '2026-10-14' },
      },
      now,
    );
    expect(d.tasks[0]?.freq).toBe(7);
    expect(d.current).toBeNull();
  });

  it('recusa arquivo sem tarefas ou de versão mais nova', () => {
    expect(() => parseData({ foo: 1 }, now)).toThrow(InvalidDataError);
    expect(() => parseData({ version: 99, tasks: [] }, now)).toThrow(
      InvalidDataError,
    );
  });
});
