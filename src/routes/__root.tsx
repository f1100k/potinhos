import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from '../app/Toaster';

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});
