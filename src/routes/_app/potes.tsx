import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/potes')({ component: Home });

function Home() {
  return <h1>Meus potes</h1>;
}
