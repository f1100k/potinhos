import type { Conquista, ISODate, Pote, Task } from './types';

/** Quantas vezes uma tarefa ainda pode sair nesta semana. */
export function restante(t: Task): number {
  if (t.paused) return 0;
  return Math.max(0, (t.freq ?? 0) + (t.extra ?? 0) - (t.doneWeek ?? 0));
}

/** Tarefas que podem sair no sorteio do pote. */
export function pool(tasks: readonly Task[], pote: Pote): Task[] {
  return tasks.filter(
    (t) =>
      t.pote === pote &&
      t.status !== 'pendente' &&
      (pote !== 'semanal' || restante(t) > 0),
  );
}

/** Quantos papeizinhos o pote mostra. */
export function contagem(tasks: readonly Task[], pote: Pote): number {
  const p = pool(tasks, pote);
  if (pote !== 'semanal') return p.length;
  return p.reduce((soma, t) => soma + restante(t), 0);
}

/**
 * Sorteia uma tarefa do pote, com chance igual para cada uma.
 * Devolve `null` quando o pote está vazio.
 */
export function sortear(
  tasks: readonly Task[],
  pote: Pote,
  random: () => number = Math.random,
): Task | null {
  const p = pool(tasks, pote);
  if (p.length === 0) return null;
  const i = Math.min(p.length - 1, Math.floor(random() * p.length));
  return p[i] ?? null;
}

/** Semanal com tarefas ativas e nada mais para fazer nesta semana. */
export function semanaCompleta(tasks: readonly Task[]): boolean {
  return (
    contagem(tasks, 'semanal') === 0 &&
    tasks.some((t) => t.pote === 'semanal' && t.status !== 'pendente')
  );
}

/**
 * Conclui a tarefa sorteada. Simples e Complexas saem da lista; no Semanal,
 * soma uma vez na semana. Pendentes sempre saem. Tudo vira conquista.
 */
export function concluir(
  tasks: readonly Task[],
  done: readonly Conquista[],
  taskId: string,
  conquista: { id: string; date: ISODate },
): { tasks: Task[]; done: Conquista[] } {
  const t = tasks.find((x) => x.id === taskId);
  if (!t) return { tasks: [...tasks], done: [...done] };
  const fica = t.pote === 'semanal' && t.status !== 'pendente';
  const novas = fica
    ? tasks.map((x) =>
        x.id === taskId ? { ...x, doneWeek: (x.doneWeek ?? 0) + 1 } : x,
      )
    : tasks.filter((x) => x.id !== taskId);
  return {
    tasks: novas,
    done: [{ ...conquista, text: t.text, pote: t.pote }, ...done],
  };
}

/**
 * Coloca a tarefa em outro pote. Zera o progresso da semana e, ao entrar
 * no Semanal, começa com 1 vez por semana. Fora do Semanal, os campos
 * semanais somem. Mantém o status (pendente continua pendente).
 */
export function moverPote(t: Task, pote: Pote): Task {
  const base: Task = { id: t.id, text: t.text, pote };
  if (t.status) base.status = t.status;
  if (pote !== 'semanal') return base;
  return {
    ...base,
    freq: t.pote === 'semanal' ? (t.freq ?? 1) : 1,
    doneWeek: 0,
    extra: 0,
    ...(t.paused ? { paused: true } : {}),
  };
}

/** Tira a marca de pendente e põe a tarefa no pote (pode ser o mesmo). */
export function voltarAoPote(t: Task, pote: Pote): Task {
  const { status: _status, ...semStatus } = t;
  return pote === t.pote ? semStatus : moverPote(semStatus, pote);
}

export type EscolhaNaoConsegui =
  | { kind: 'devolver' }
  | { kind: 'mover'; pote: Pote }
  | { kind: 'pendente' };

/** O que fazer com o papelzinho quando não deu hoje. */
export function naoConsegui(
  tasks: readonly Task[],
  taskId: string,
  escolha: EscolhaNaoConsegui,
): Task[] {
  const aplicar = (t: Task): Task => {
    switch (escolha.kind) {
      case 'devolver':
        return voltarAoPote(t, t.pote);
      case 'mover':
        return voltarAoPote(t, escolha.pote);
      case 'pendente':
        return { ...t, status: 'pendente' };
    }
  };
  return tasks.map((t) => (t.id === taskId ? aplicar(t) : t));
}

export type DecisaoSemana = 'levar' | 'pendente' | 'deixar';

/** Tarefas do Semanal que sobraram na semana. */
export function sobras(tasks: readonly Task[]): Task[] {
  return tasks.filter(
    (t) => t.pote === 'semanal' && t.status !== 'pendente' && restante(t) > 0,
  );
}

/**
 * Fecha a semana do pote Semanal. Para cada sobra, aplica a decisão
 * (`levar` é o padrão): levar guarda o que faltou em `extra`, pendente
 * cria uma cópia pendente e deixar ir não carrega nada. Depois, todas
 * recomeçam com `doneWeek = 0`.
 */
export function fecharSemana(
  tasks: readonly Task[],
  decisoes: Readonly<Record<string, DecisaoSemana>>,
  newId: () => string,
): Task[] {
  const copias: Task[] = [];
  const fechadas = tasks.map((t) => {
    if (t.pote !== 'semanal' || t.status === 'pendente') return t;
    const r = restante(t);
    const d = decisoes[t.id] ?? 'levar';
    if (r > 0 && d === 'pendente') {
      copias.push({
        id: newId(),
        text: t.text,
        pote: 'semanal',
        status: 'pendente',
      });
    }
    return { ...t, doneWeek: 0, extra: r > 0 && d === 'levar' ? r : 0 };
  });
  return [...fechadas, ...copias];
}
