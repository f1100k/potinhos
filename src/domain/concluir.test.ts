import { describe, expect, it } from 'vitest';
import { addDays, fromISODate, toISODate } from './dates';
import { concluir } from './rules';
import type { Task } from './types';

const tasks: Task[] = [
  { id: 's', text: 'Lavar a louça', pote: 'simples' },
  { id: 'c', text: 'Organizar as finanças', pote: 'complexas' },
  {
    id: 'w',
    text: 'Caminhar',
    pote: 'semanal',
    freq: 3,
    doneWeek: 1,
    extra: 0,
  },
  { id: 'p', text: 'Ligar para a tia', pote: 'semanal', status: 'pendente' },
];
const hoje = { id: 'k1', date: '2026-10-17' };

describe('concluir', () => {
  it('tira Simples e Complexas da lista', () => {
    expect(concluir(tasks, [], 's', hoje).tasks.map((t) => t.id)).toEqual([
      'c',
      'w',
      'p',
    ]);
    expect(
      concluir(tasks, [], 'c', hoje).tasks.find((t) => t.id === 'c'),
    ).toBeUndefined();
  });

  it('no Semanal soma uma vez na semana e mantém a tarefa', () => {
    const r = concluir(tasks, [], 'w', hoje);
    expect(r.tasks.find((t) => t.id === 'w')?.doneWeek).toBe(2);
  });

  it('pendente sai da lista mesmo sendo do Semanal', () => {
    const r = concluir(tasks, [], 'p', hoje);
    expect(r.tasks.find((t) => t.id === 'p')).toBeUndefined();
  });

  it('registra a conquista com a data de hoje, mais recente primeiro', () => {
    const antes = [
      {
        id: 'k0',
        text: 'Antiga',
        pote: 'simples' as const,
        date: '2026-10-01',
      },
    ];
    const r = concluir(tasks, antes, 'w', hoje);
    expect(r.done).toEqual([
      { id: 'k1', text: 'Caminhar', pote: 'semanal', date: '2026-10-17' },
      antes[0],
    ]);
  });

  it('ignora id desconhecido', () => {
    const r = concluir(tasks, [], 'x', hoje);
    expect(r.tasks).toEqual(tasks);
    expect(r.done).toEqual([]);
  });
});

describe('datas locais', () => {
  it('formata sem passar por UTC', () => {
    expect(toISODate(new Date(2026, 9, 17, 23, 59))).toBe('2026-10-17');
  });

  it('volta e soma dias', () => {
    expect(toISODate(fromISODate('2026-10-17'))).toBe('2026-10-17');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});
