import { z } from 'zod';

export const POTES = ['simples', 'complexas', 'semanal'] as const;
export const poteSchema = z.enum(POTES);

export type Pote = (typeof POTES)[number];

export const POTE_LABEL: Record<Pote, string> = {
  simples: 'Simples',
  complexas: 'Complexas',
  semanal: 'Semanal',
};

/** Data local no formato `YYYY-MM-DD`. */
export type ISODate = string;
export const isoDateSchema = z.iso.date();

export type Task = {
  id: string;
  text: string;
  pote: Pote;
  status?: 'pendente';
  /** Semanal: quantas vezes por semana (1 a 7). */
  freq?: number;
  /** Semanal: quantas vezes já saiu e foi concluída nesta semana. */
  doneWeek?: number;
  /** Semanal: vezes trazidas da semana anterior. */
  extra?: number;
  /** Semanal: pausada não entra no sorteio. */
  paused?: boolean;
};

export type Conquista = {
  id: string;
  text: string;
  pote: Pote;
  date: ISODate;
};

export type Settings = {
  sounds: boolean;
};

export type Meta = {
  schemaVersion: number;
  /** Já passou pela landing e clicou em "Começar". */
  visited: boolean;
  /** Segunda-feira em que começa a semana atual do pote Semanal. */
  weekStart: ISODate;
  /** Segunda-feira da última semana fechada. */
  lastWeekClosed: ISODate | null;
};

/** O papelzinho sorteado. Vale até o fim do dia em que saiu. */
export type Sorteada = {
  taskId: string;
  date: ISODate;
};

export type AppData = {
  tasks: Task[];
  done: Conquista[];
  settings: Settings;
  meta: Meta;
  current: Sorteada | null;
};

export const MIN_FREQ = 1;
export const MAX_FREQ = 7;
