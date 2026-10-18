import { isWeekend, startOfWeek } from 'date-fns';
import { addDays, toISODate } from './dates';
import type { ISODate, Meta } from './types';

/**
 * A semana vai de segunda 00:00 a domingo 23:59, no fuso local.
 * Devolve a segunda-feira da semana de `now`.
 */
export function mondayOf(now: Date): ISODate {
  return toISODate(startOfWeek(now, { weekStartsOn: 1 }));
}

/** Domingo da semana que começa em `weekStart`. */
export function sundayOf(weekStart: ISODate): ISODate {
  return addDays(weekStart, 6);
}

/**
 * A semana do pote Semanal já virou e ainda não foi fechada.
 * Nada fecha sozinho: ela fica pendente até a pessoa abrir o app.
 * Se passaram várias semanas, ainda é um fechamento só.
 */
export function semanaPendente(meta: Meta, now: Date): boolean {
  return mondayOf(now) > meta.weekStart;
}

/** A partir de sexta às 18h, a home pode sugerir fechar a semana. */
export const CARD_DIA = 5; // sexta
export const CARD_HORA = 18;

export function fimDeSemanaChegando(meta: Meta, now: Date): boolean {
  if (meta.weekStart !== mondayOf(now)) return false;
  if (isWeekend(now)) return true;
  return now.getDay() === CARD_DIA && now.getHours() >= CARD_HORA;
}

/**
 * Segunda-feira em que começa a próxima semana depois de fechar.
 * Fechando uma semana atrasada, a nova é a semana de hoje. Fechando
 * antes da virada (no fim de semana), a nova começa na próxima segunda.
 */
export function proximaSemana(meta: Meta, now: Date): ISODate {
  const atual = mondayOf(now);
  return semanaPendente(meta, now) ? atual : addDays(atual, 7);
}

/** Meta depois de fechar a semana. */
export function metaFechada(meta: Meta, now: Date): Meta {
  return {
    ...meta,
    lastWeekClosed: meta.weekStart,
    weekStart: proximaSemana(meta, now),
  };
}
