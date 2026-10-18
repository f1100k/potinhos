import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_flow/jars/task')({
  component: CurrentTask,
});

function CurrentTask() {
  return <h1>Tarefa em andamento</h1>;
}
