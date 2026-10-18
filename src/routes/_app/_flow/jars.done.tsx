import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_flow/jars/done')({
  component: Done,
});

function Done() {
  return <h1>Concluí</h1>;
}
