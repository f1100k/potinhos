import { z } from 'zod';
import { jarSchema } from '../domain/types';

export const optional = <T extends z.ZodType>(schema: T) =>
  schema.optional().catch(undefined);

export const byJar = z.object({ jar: optional(jarSchema) });
