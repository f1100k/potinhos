import { describe, expect, it } from 'vitest';
import { moverPote, naoConsegui, voltarAoPote } from './rules';
import type { Task } from './types';

const simples: Task = { id: 's', text: 'Lavar a louça', pote: 'simples' };
const semanal: Task = {
  id: 'w',
  text: 'Caminhar',
  pote: 'semanal',
  freq: 3,
  doneWeek: 2,
  extra: 1,
};

describe('moverPote', () => {
  it('ao entrar no Semanal começa com 1x por semana', () => {
    expect(moverPote(simples, 'semanal')).toEqual({
      id: 's',
      text: 'Lavar a louça',
      pote: 'semanal',
      freq: 1,
      doneWeek: 0,
      extra: 0,
    });
  });

  it('ao sair do Semanal tira os campos semanais', () => {
    expect(moverPote(semanal, 'complexas')).toEqual({
      id: 'w',
      text: 'Caminhar',
      pote: 'complexas',
    });
  });

  it('zera doneWeek e extra e mantém o status', () => {
    const t = moverPote({ ...semanal, status: 'pendente' }, 'semanal');
    expect(t).toMatchObject({ doneWeek: 0, extra: 0, status: 'pendente' });
  });
});

describe('voltarAoPote', () => {
  it('tira o pendente e mantém o pote', () => {
    const t = voltarAoPote({ ...simples, status: 'pendente' }, 'simples');
    expect(t).toEqual(simples);
  });
});

describe('naoConsegui', () => {
  const tasks = [simples, semanal];

  it('devolver mantém no mesmo pote', () => {
    expect(naoConsegui(tasks, 's', { kind: 'devolver' })).toEqual(tasks);
  });

  it('mover troca de pote', () => {
    const r = naoConsegui(tasks, 's', { kind: 'mover', pote: 'complexas' });
    expect(r[0]?.pote).toBe('complexas');
    expect(r[1]).toBe(semanal);
  });

  it('pendente mantém o pote de origem', () => {
    const r = naoConsegui(tasks, 'w', { kind: 'pendente' });
    expect(r[1]).toEqual({ ...semanal, status: 'pendente' });
  });

  it('devolver uma pendente retomada tira a marca de pendente', () => {
    const r = naoConsegui([{ ...simples, status: 'pendente' }], 's', {
      kind: 'devolver',
    });
    expect(r[0]?.status).toBeUndefined();
  });
});
