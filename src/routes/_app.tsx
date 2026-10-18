import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Shell } from '../app/Shell';

/** Telas do app, dentro do menu lateral e da barra inferior. */
export const Route = createFileRoute('/_app')({
  component: () => (
    <Shell>
      <Outlet />
    </Shell>
  ),
});
