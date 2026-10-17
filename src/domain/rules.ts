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
