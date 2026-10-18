import { createFileRoute, Outlet } from '@tanstack/react-router';
import { Shell } from '../../components/layouts/Shell';
import { useInFlow } from '../../features/jars/hooks/useFlow';

function AppLayout() {
  return (
    <Shell bottomNav={!useInFlow()}>
      <Outlet />
    </Shell>
  );
}

export const Route = createFileRoute('/_app')({ component: AppLayout });
