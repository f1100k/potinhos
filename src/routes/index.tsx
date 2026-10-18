import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({ component: Landing });

function Landing() {
  return <h1>Como funciona</h1>;
}
