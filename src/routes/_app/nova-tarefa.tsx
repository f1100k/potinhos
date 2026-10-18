import { createFileRoute } from '@tanstack/react-router';
import { porPote } from '../../app/search';

export const Route = createFileRoute('/_app/nova-tarefa')({
  validateSearch: porPote,
  component: Add,
});

function Add() {
  return <h1>Nova tarefa</h1>;
}
