import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from 'sonner';
import { beforeEach, describe, expect, it } from 'vitest';
import { dispatch, useAppData } from '../../../stores/appData';
import { createInitialData } from '../../../stores/appReducer';
import type { Task } from '../../../types/model';
import { deleteTaskWithUndo } from '../deleteTaskWithUndo';

const DISHES: Task = { id: 'a', text: 'Lavar a louça', jar: 'simple' };
const AUNT: Task = { id: 'b', text: 'Ligar para a tia', jar: 'complex' };

describe('deleteTaskWithUndo', () => {
  beforeEach(() => {
    dispatch({
      type: 'replace',
      data: { ...createInitialData(new Date()), tasks: [DISHES, AUNT] },
    });
  });

  it('deletes the slip and the undo puts it back in place', async () => {
    render(<Toaster />);
    deleteTaskWithUndo(DISHES);
    expect(useAppData.getState().tasks).toEqual([AUNT]);
    expect(await screen.findByText('Papelzinho excluído.')).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Desfazer' }));
    expect(useAppData.getState().tasks).toEqual([DISHES, AUNT]);
  });
});
