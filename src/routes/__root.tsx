import { createRootRoute, Outlet } from '@tanstack/react-router';
import { consumeAppOpening } from '../app/appOpening';
import { Toaster } from '../app/Toaster';

export const Route = createRootRoute({
  beforeLoad: () => ({ appOpening: consumeAppOpening() }),
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});
