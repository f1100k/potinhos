import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/jars')({ component: Home });

function Home() {
  return <h1>Meus potes</h1>;
}
