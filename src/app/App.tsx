import { RouterProvider } from '@tanstack/react-router';
import { type createAppRouter, router as defaultRouter } from './router';

type Props = {
  router?: ReturnType<typeof createAppRouter>;
};

export function App({ router = defaultRouter }: Props) {
  return <RouterProvider router={router} />;
}
