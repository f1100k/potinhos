import { describe, expect, it } from 'vitest';
import { contagem, pool, restante, semanaCompleta, sortear } from './rules';
import type { Task } from './types';

const simples = (id: string, extra: Partial<Task> = {}): Task => ({
  id,
  text: id,
  pote: 'simples',
  ...extra,
});

const semanal = (id: string, extra: Partial<Task> = {}): Task => ({
  id,
  text: id,
  pote: 'semanal',
  freq: 2,
  doneWeek: 0,
  extra: 0,
  ...extra,
});

describe('restante', () => {
  it('é freq + extra − doneWeek', () => {
    expect(restante(semanal('a', { freq: 3, extra: 1, doneWeek: 2 }))).toBe(2);
  });

  it('nunca fica negativo', () => {
    expect(restante(semanal('a', { freq: 1, doneWeek: 3 }))).toBe(0);
  });

  it('é zero quando a tarefa está pausada', () => {
    expect(restante(semanal('a', { paused: true }))).toBe(0);
  });

  it('trata campos ausentes como zero', () => {
    expect(restante(simples('a'))).toBe(0);
  });
});

describe('pool', () => {
  it('ignora pendentes e outros potes', () => {
    const tasks = [
      simples('a'),
      simples('b', { status: 'pendente' }),
      { ...simples('c'), pote: 'complexas' as const },
    ];
    expect(pool(tasks, 'simples').map((t) => t.id)).toEqual(['a']);
  });

  it('no Semanal só entram as que têm restante', () => {
    const tasks = [
      semanal('a'),
      semanal('b', { doneWeek: 2 }),
      semanal('c', { paused: true }),
    ];
    expect(pool(tasks, 'semanal').map((t) => t.id)).toEqual(['a']);
  });
});

describe('contagem', () => {
  it('é o tamanho do pool em Simples e Complexas', () => {
    expect(contagem([simples('a'), simples('b')], 'simples')).toBe(2);
  });

  it('é a soma dos restantes no Semanal', () => {
    const tasks = [semanal('a', { freq: 3 }), semanal('b', { doneWeek: 1 })];
    expect(contagem(tasks, 'semanal')).toBe(4);
  });
});

describe('sortear', () => {
  const tasks = [simples('a'), simples('b'), simples('c')];

  it('devolve null com o pote vazio', () => {
    expect(sortear(tasks, 'complexas')).toBeNull();
  });

  it('escolhe pelo número aleatório, de forma uniforme', () => {
    expect(sortear(tasks, 'simples', () => 0)?.id).toBe('a');
    expect(sortear(tasks, 'simples', () => 0.5)?.id).toBe('b');
    expect(sortear(tasks, 'simples', () => 0.99)?.id).toBe('c');
  });

  it('não estoura com random() = 1', () => {
    expect(sortear(tasks, 'simples', () => 1)?.id).toBe('c');
  });

  it('cada tarefa sai com frequência parecida', () => {
    const vezes: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 3000; i++) {
      const t = sortear(tasks, 'simples', () => i / 3000);
      if (t) vezes[t.id] = (vezes[t.id] ?? 0) + 1;
    }
    expect(vezes).toEqual({ a: 1000, b: 1000, c: 1000 });
  });
});

describe('semanaCompleta', () => {
  it('é verdade quando tudo do Semanal foi feito', () => {
    expect(semanaCompleta([semanal('a', { doneWeek: 2 })])).toBe(true);
  });

  it('é falso quando ainda falta algo', () => {
    expect(semanaCompleta([semanal('a', { doneWeek: 1 })])).toBe(false);
  });

  it('é falso sem tarefas semanais', () => {
    expect(semanaCompleta([simples('a')])).toBe(false);
  });
});
