import { describe, expect, it } from 'vitest';
import { fecharSemana, restante, sobras } from './rules';
import type { Task } from './types';

const w = (id: string, extra: Partial<Task> = {}): Task => ({
  id,
  text: id,
  pote: 'semanal',
  freq: 3,
  doneWeek: 1,
  extra: 0,
  ...extra,
});

const ids = () => {
  let n = 0;
  return () => `novo-${++n}`;
};

describe('sobras', () => {
  it('lista só semanais ativas com restante', () => {
    const tasks: Task[] = [
      w('a'),
      w('b', { doneWeek: 3 }),
      w('c', { status: 'pendente' }),
      w('d', { paused: true }),
      { id: 'e', text: 'e', pote: 'simples' },
    ];
    expect(sobras(tasks).map((t) => t.id)).toEqual(['a']);
  });
});

describe('fecharSemana', () => {
  it('levar é o padrão e guarda o que faltou em extra', () => {
    const [a] = fecharSemana([w('a')], {}, ids());
    expect(a).toMatchObject({ doneWeek: 0, extra: 2 });
    expect(a && restante(a)).toBe(5);
  });

  it('pendente cria uma cópia pendente e não carrega extra', () => {
    const r = fecharSemana([w('a')], { a: 'pendente' }, ids());
    expect(r).toEqual([
      { ...w('a'), doneWeek: 0, extra: 0 },
      { id: 'novo-1', text: 'a', pote: 'semanal', status: 'pendente' },
    ]);
  });

  it('deixar ir só recomeça a semana', () => {
    const [a] = fecharSemana([w('a', { extra: 2 })], { a: 'deixar' }, ids());
    expect(a).toMatchObject({ doneWeek: 0, extra: 0 });
  });

  it('zera doneWeek de quem completou a semana', () => {
    const [a] = fecharSemana([w('a', { doneWeek: 3 })], {}, ids());
    expect(a).toMatchObject({ doneWeek: 0, extra: 0 });
  });

  it('não mexe em outros potes nem em pendentes', () => {
    const outras: Task[] = [
      { id: 's', text: 's', pote: 'simples' },
      w('p', { status: 'pendente' }),
    ];
    expect(fecharSemana(outras, {}, ids())).toEqual(outras);
  });
});
