import { createFileRoute } from '@tanstack/react-router';
import { byJar } from '../../app/search';

export const Route = createFileRoute('/_app/new-task')({
  validateSearch: byJar,
  component: NewTask,
});

function NewTask() {
  return <h1>Nova tarefa</h1>;
}
