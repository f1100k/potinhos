import { createFileRoute } from '@tanstack/react-router';
import { jarSearch } from '../../app/searchParams';

export const Route = createFileRoute('/_app/new-task')({
  validateSearch: jarSearch,
  component: NewTask,
});

function NewTask() {
  return <h1>Nova tarefa</h1>;
}
