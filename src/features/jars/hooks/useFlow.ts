import {
  type NavigateOptions,
  type RegisteredRouter,
  type RouteIds,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { useCallback } from 'react';
import { unlockFlow } from '../../../stores/session';

const FLOW_ROUTE_ID: RouteIds<RegisteredRouter['routeTree']> = '/_app/_flow';

export function useInFlow(): boolean {
  return useRouterState({
    select: (s) => s.matches.some((m) => m.routeId === FLOW_ROUTE_ID),
  });
}

/**
 * Inside the flow, replaces the history entry so "back" doesn't redo steps.
 * @public
 */
export function useFlowNavigate() {
  const navigate = useNavigate();
  const inFlow = useInFlow();
  return useCallback(
    <TTo extends string>(
      opts: NavigateOptions<RegisteredRouter, string, TTo>,
    ) => {
      unlockFlow();
      return navigate({ ...opts, replace: inFlow } as NavigateOptions);
    },
    [navigate, inFlow],
  );
}
