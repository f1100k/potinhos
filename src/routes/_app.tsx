import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Shell } from '../app/Shell';

export const Route = createFileRoute('/_app')({
  component: () => (
    <Shell>
      <Outlet />
    </Shell>
  ),
});
