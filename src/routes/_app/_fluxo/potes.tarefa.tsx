import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_fluxo/potes/tarefa')({
  component: Task,
});

function Task() {
  return <h1>Tarefa em andamento</h1>;
}
