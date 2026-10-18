import { dispatch, useAppData } from '../../stores/appData';
import type { Task } from '../../types/model';
import { toast } from '../ui/Toast';

export function deleteTaskWithUndo(task: Task): void {
  const index = useAppData.getState().tasks.findIndex((t) => t.id === task.id);
  dispatch({ type: 'deleteTask', id: task.id });
  toast('Papelzinho excluído.', {
    label: 'Desfazer',
    onClick: () => dispatch({ type: 'restoreTask', task, index }),
  });
}
