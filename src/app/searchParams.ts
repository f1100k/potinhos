import { z } from 'zod';
import { jarSchema } from '../domain/types';

export const optionalParam = <T extends z.ZodType>(schema: T) =>
  schema.optional().catch(undefined);

export const jarSearch = z.object({ jar: optionalParam(jarSchema) });
