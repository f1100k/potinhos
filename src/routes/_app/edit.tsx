import { createFileRoute } from '@tanstack/react-router';
import { jarSearch } from '../../app/searchParams';

export const Route = createFileRoute('/_app/edit')({
  validateSearch: jarSearch,
  component: Edit,
});

function Edit() {
  return <h1>Ver e editar potes</h1>;
}
