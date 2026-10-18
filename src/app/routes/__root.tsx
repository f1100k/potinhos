import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router';
import { Toaster } from '../../components/layouts/Toaster';
import { useInFlow } from '../../features/jars/hooks/useFlow';
import { consumeAppOpening } from '../../stores/session';

function Root() {
  const inFlow = useInFlow();
  const onLanding = useLocation({ select: (l) => l.pathname === '/' });
  return (
    <>
      <Outlet />
      <Toaster aboveBottomNav={!onLanding && !inFlow} />
    </>
  );
}

export const Route = createRootRoute({
  beforeLoad: () => ({ appOpening: consumeAppOpening() }),
  component: Root,
});
