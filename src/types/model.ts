import { z } from 'zod';

export const JARS = ['simple', 'complex', 'weekly'] as const;
export const jarSchema = z.enum(JARS);

export type Jar = (typeof JARS)[number];

export type ISODate = string;
export const isoDateSchema = z.iso.date();

export type Task = {
  id: string;
  text: string;
  jar: Jar;
  status?: 'pending';
  freq?: number;
  doneWeek?: number;
  carriedOver?: number;
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
  visited: boolean;
  weekStart: ISODate;
  lastWeekClosed: ISODate | null;
};

export type DrawnTask = {
  taskId: string;
  date: ISODate;
};

export type NotDoneChoice =
  | { kind: 'return' }
  | { kind: 'move'; jar: Jar }
  | { kind: 'pending' };

export type WeekDecision = 'carry' | 'pending' | 'drop';

export type AppData = {
  tasks: Task[];
  achievements: Achievement[];
  settings: Settings;
  meta: Meta;
  drawn: DrawnTask | null;
};

export type AppAction =
  | { type: 'visit' }
  | { type: 'addTask'; id: string; text: string; jar: Jar; freq?: number }
  | { type: 'editTask'; id: string; text: string }
  | { type: 'moveTask'; id: string; jar: Jar }
  | { type: 'deleteTask'; id: string }
  | { type: 'restoreTask'; task: Task; index: number }
  | { type: 'setFreq'; id: string; freq: number }
  | { type: 'togglePause'; id: string }
  | { type: 'draw'; taskId: string; now: Date }
  | { type: 'clearDrawn' }
  | { type: 'complete'; achievementId: string; now: Date }
  | { type: 'notDone'; choice: NotDoneChoice; now: Date }
  | { type: 'pendingToJar'; id: string; jar: Jar }
  | {
      type: 'closeWeek';
      decisions: Readonly<Record<string, WeekDecision>>;
      now: Date;
      ids: readonly string[];
    }
  | { type: 'setSounds'; on: boolean }
  | { type: 'replace'; data: AppData }
  | { type: 'reset'; now: Date };
