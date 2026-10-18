import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_app/edit')({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/_app/edit"!</div>;
}
