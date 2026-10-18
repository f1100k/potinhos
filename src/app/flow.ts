import {
  type NavigateOptions,
  type RegisteredRouter,
  type RouteIds,
  useNavigate,
  useRouterState,
} from '@tanstack/react-router';
import { useCallback } from 'react';

export const FLOW_ROUTE_ID: RouteIds<RegisteredRouter['routeTree']> =
  '/_app/_flow';

// The draw flow only opens through an action inside the app. Reloading the
// page or going back to a flow screen with the browser leads to the jars.
let unlocked = false;

export function unlockFlow(): void {
  unlocked = true;
}

export function consumeFlowUnlock(): boolean {
  const ok = unlocked;
  unlocked = false;
  return ok;
}

export function useInFlow(): boolean {
  return useRouterState({
    select: (s) => s.matches.some((m) => m.routeId === FLOW_ROUTE_ID),
  });
}

/** Inside the flow, replaces the history entry so "back" doesn't redo steps. */
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
