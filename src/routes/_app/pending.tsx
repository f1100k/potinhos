import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/pending')({ component: Pending });

function Pending() {
  return <h1>Pendentes</h1>;
}
