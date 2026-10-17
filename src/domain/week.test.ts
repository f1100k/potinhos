import { describe, expect, it } from 'vitest';
import type { Meta } from './types';
import {
  fimDeSemanaChegando,
  metaFechada,
  mondayOf,
  semanaPendente,
  sundayOf,
} from './week';

const meta = (weekStart: string): Meta => ({
  schemaVersion: 1,
  visited: true,
  weekStart,
  lastWeekClosed: null,
});

// 2026-10-12 é segunda; 2026-10-18 é domingo.
const at = (dia: number, h = 12, m = 0) => new Date(2026, 9, dia, h, m);

describe('mondayOf', () => {
  it('segunda é a própria segunda', () => {
    expect(mondayOf(at(12, 0, 0))).toBe('2026-10-12');
  });

  it('domingo 23:59 ainda é da mesma semana', () => {
    expect(mondayOf(at(18, 23, 59))).toBe('2026-10-12');
  });

  it('segunda 00:00 já é a semana seguinte', () => {
    expect(mondayOf(at(19, 0, 0))).toBe('2026-10-19');
  });

  it('atravessa o mês', () => {
    expect(mondayOf(new Date(2026, 10, 1))).toBe('2026-10-26');
  });

  it('sundayOf fecha a semana', () => {
    expect(sundayOf('2026-10-12')).toBe('2026-10-18');
  });
});

describe('semanaPendente', () => {
  it('não está pendente durante a semana', () => {
    expect(semanaPendente(meta('2026-10-12'), at(18, 23, 59))).toBe(false);
  });

  it('fica pendente depois de domingo 23:59', () => {
    expect(semanaPendente(meta('2026-10-12'), at(19, 0, 0))).toBe(true);
  });

  it('continua um fechamento só depois de várias semanas', () => {
    const m = meta('2026-09-28');
    const agora = at(19);
    expect(semanaPendente(m, agora)).toBe(true);
    const depois = metaFechada(m, agora);
    expect(depois.weekStart).toBe('2026-10-19');
    expect(semanaPendente(depois, agora)).toBe(false);
  });
});

describe('fimDeSemanaChegando', () => {
  it('não aparece na sexta antes das 18h', () => {
    expect(fimDeSemanaChegando(meta('2026-10-12'), at(16, 17, 59))).toBe(false);
  });

  it('aparece na sexta à noite, sábado e domingo', () => {
    expect(fimDeSemanaChegando(meta('2026-10-12'), at(16, 18))).toBe(true);
    expect(fimDeSemanaChegando(meta('2026-10-12'), at(17))).toBe(true);
    expect(fimDeSemanaChegando(meta('2026-10-12'), at(18, 23))).toBe(true);
  });

  it('some depois de fechar a semana antes da virada', () => {
    const fechada = metaFechada(meta('2026-10-12'), at(17));
    expect(fechada.weekStart).toBe('2026-10-19');
    expect(fechada.lastWeekClosed).toBe('2026-10-12');
    expect(fimDeSemanaChegando(fechada, at(18))).toBe(false);
    expect(semanaPendente(fechada, at(19, 9))).toBe(false);
  });
});
