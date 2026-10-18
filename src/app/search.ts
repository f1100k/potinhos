import { z } from 'zod';
import { poteSchema } from '../domain/types';

// Parâmetro opcional: um valor inválido na URL é ignorado. Os obrigatórios,
// do fluxo, só faltam se a URL foi editada à mão, e aí a validação falha.
export const opcional = <T extends z.ZodType>(schema: T) =>
  schema.optional().catch(undefined);

/** Telas que podem abrir já com um pote escolhido. */
export const porPote = z.object({ pote: opcional(poteSchema) });
