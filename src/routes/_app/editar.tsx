import { createFileRoute } from '@tanstack/react-router';
import { porPote } from '../../app/search';

export const Route = createFileRoute('/_app/editar')({
  validateSearch: porPote,
  component: Edit,
});

function Edit() {
  return <h1>Ver e editar potes</h1>;
}
