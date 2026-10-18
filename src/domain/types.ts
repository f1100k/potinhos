import { z } from 'zod';

export const JARS = ['simple', 'complex', 'weekly'] as const;
export const jarSchema = z.enum(JARS);

export type Jar = (typeof JARS)[number];

export const JAR_LABEL: Record<Jar, string> = {
  simple: 'Simples',
  complex: 'Complexas',
  weekly: 'Semanal',
};

export type ISODate = string;
export const isoDateSchema = z.iso.date();

export type Task = {
  id: string;
  text: string;
  jar: Jar;
  status?: 'pending';
  freq?: number;
  doneWeek?: number;
  /** Times carried over from the previous week. */
  extra?: number;
  paused?: boolean;
};

export type Achievement = {
  id: string;
  text: string;
  jar: Jar;
  date: ISODate;
};

export type Settings = {
  sounds: boolean;
};

export type Meta = {
  schemaVersion: number;
  visited: boolean;
  weekStart: ISODate;
  lastWeekClosed: ISODate | null;
};

export type DrawnTask = {
  taskId: string;
  date: ISODate;
};

export type AppData = {
  tasks: Task[];
  done: Achievement[];
  settings: Settings;
  meta: Meta;
  current: DrawnTask | null;
};

export const MIN_FREQ = 1;
export const MAX_FREQ = 7;
