import { RouterProvider } from '@tanstack/react-router';
import { AppStoreProvider } from './AppStore';
import { type createAppRouter, router as defaultRouter } from './router';

type Props = {
  router?: ReturnType<typeof createAppRouter>;
};

export function App({ router = defaultRouter }: Props) {
  return (
    <AppStoreProvider>
      <RouterProvider router={router} />
    </AppStoreProvider>
  );
}
