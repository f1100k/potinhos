import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import type { Task } from '../types/model';
import { renderApp } from './renderApp';
import { seedData } from './seedData';

export const TODAY = new Date(2026, 9, 14, 10);

export const DISHES: Task = { id: 'a', text: 'Lavar a louça', jar: 'simple' };

/** Opens the task screen with `task` already drawn today. */
export async function openDrawnTask(task: Task = DISHES) {
  seedData(TODAY, {
    tasks: [task],
    drawn: { taskId: task.id, date: '2026-10-14' },
  });
  const router = await renderApp('/jars');
  const [anyJar] = screen.getAllByRole('button', { name: /^Pote / });
  if (anyJar) await userEvent.click(anyJar);
  await screen.findByRole('heading', { name: 'Sua tarefa de hoje' });
  return router;
}

export async function waitMs(ms: number) {
  await act(() => vi.advanceTimersByTimeAsync(ms));
}
