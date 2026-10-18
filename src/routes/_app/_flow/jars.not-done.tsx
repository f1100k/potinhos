import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_flow/jars/not-done')({
  component: NotDone,
});

function NotDone() {
  return <h1>Não consegui hoje</h1>;
}
