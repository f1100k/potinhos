import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_flow/jars/weekend')({
  component: Weekend,
});

function Weekend() {
  return <h1>Fim de semana</h1>;
}
