import { describe, expect, it } from 'vitest';
import {
  type AppAction,
  appReducer,
  createInitialData,
  tarefaAtual,
} from './store';
import type { AppData } from './types';

const now = new Date(2026, 9, 14, 10); // quarta
const run = (data: AppData, ...actions: AppAction[]) =>
  actions.reduce(appReducer, data);

const base = () =>
  run(
    createInitialData(now),
    { type: 'addTask', id: 's', text: '  Lavar a louça ', pote: 'simples' },
    { type: 'addTask', id: 'w', text: 'Caminhar', pote: 'semanal', freq: 3 },
  );

describe('createInitialData', () => {
  it('começa vazio, com sons ligados e a semana atual', () => {
    const d = createInitialData(now);
    expect(d.tasks).toEqual([]);
    expect(d.done).toEqual([]);
    expect(d.settings.sounds).toBe(true);
    expect(d.meta).toMatchObject({ visited: false, weekStart: '2026-10-12' });
  });
});

describe('appReducer', () => {
  it('adiciona tarefas aparando o texto e ignora texto vazio', () => {
    const d = run(base(), {
      type: 'addTask',
      id: 'x',
      text: '   ',
      pote: 'simples',
    });
    expect(d.tasks).toEqual([
      { id: 's', text: 'Lavar a louça', pote: 'simples' },
      {
        id: 'w',
        text: 'Caminhar',
        pote: 'semanal',
        freq: 3,
        doneWeek: 0,
        extra: 0,
      },
    ]);
  });

  it('limita a frequência entre 1 e 7', () => {
    const d = run(base(), { type: 'setFreq', id: 'w', freq: 12 });
    expect(d.tasks[1]?.freq).toBe(7);
    expect(run(d, { type: 'setFreq', id: 'w', freq: 0 }).tasks[1]?.freq).toBe(
      1,
    );
  });

  it('pausa e retoma', () => {
    const d = run(base(), { type: 'togglePause', id: 'w' });
    expect(d.tasks[1]?.paused).toBe(true);
    expect(
      run(d, { type: 'togglePause', id: 'w' }).tasks[1],
    ).not.toHaveProperty('paused');
  });

  it('sorteia, conclui e limpa a tarefa atual', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 's', date: '2026-10-14' },
      { type: 'conclude', conquistaId: 'k', date: '2026-10-14' },
    );
    expect(d.current).toBeNull();
    expect(d.tasks.map((t) => t.id)).toEqual(['w']);
    expect(d.done[0]).toMatchObject({ id: 'k', text: 'Lavar a louça' });
  });

  it('não consegui deixa pendente', () => {
    const d = run(
      base(),
      { type: 'draw', taskId: 's', date: '2026-10-14' },
      { type: 'notDone', escolha: { kind: 'pendente' } },
    );
    expect(d.tasks[0]?.status).toBe('pendente');
    expect(d.current).toBeNull();
  });

  it('exclui e desfaz na mesma posição', () => {
    const d0 = base();
    const task = d0.tasks[0];
    if (!task) throw new Error('sem tarefa');
    const d1 = run(d0, { type: 'deleteTask', id: 's' });
    expect(d1.tasks.map((t) => t.id)).toEqual(['w']);
    const d2 = run(d1, { type: 'restoreTask', task, index: 0 });
    expect(d2.tasks.map((t) => t.id)).toEqual(['s', 'w']);
  });

  it('fecha a semana e avança a meta', () => {
    const d = run(base(), {
      type: 'closeWeek',
      decisoes: { w: 'pendente' },
      now: new Date(2026, 9, 19, 9),
      ids: ['copia'],
    });
    expect(d.meta).toMatchObject({
      weekStart: '2026-10-19',
      lastWeekClosed: '2026-10-12',
    });
    expect(d.tasks.at(-1)).toMatchObject({ id: 'copia', status: 'pendente' });
  });

  it('reset volta ao estado inicial', () => {
    const d = run(base(), { type: 'visit' }, { type: 'reset', now });
    expect(d).toEqual(createInitialData(now));
  });
});

describe('tarefaAtual', () => {
  it('vale só no dia do sorteio', () => {
    const d = run(base(), { type: 'draw', taskId: 's', date: '2026-10-14' });
    expect(tarefaAtual(d, '2026-10-14')?.id).toBe('s');
    expect(tarefaAtual(d, '2026-10-15')).toBeNull();
  });
});
