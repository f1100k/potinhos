import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/_fluxo/potes/fim-de-semana')({
  component: Weekend,
});

function Weekend() {
  return <h1>Fim de semana</h1>;
}
