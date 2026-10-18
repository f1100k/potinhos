import { createFileRoute, redirect } from '@tanstack/react-router';
import { consumeFlowUnlock } from '../../app/flow';

export const Route = createFileRoute('/_app/_flow')({
  beforeLoad: ({ cause }) => {
    if (cause === 'enter' && !consumeFlowUnlock()) {
      throw redirect({ to: '/jars', replace: true });
    }
  },
});
