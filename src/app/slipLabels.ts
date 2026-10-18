export function slipCountLabel(count: number): string {
  if (count === 0) return 'vazio';
  if (count === 1) return '1 papelzinho';
  return `${count} papeizinhos`;
}

export function savedSlipsLabel(count: number): string {
  if (count === 0) return 'ainda vazio';
  if (count === 1) return '1 papelzinho guardado';
  return `${count} papeizinhos guardados`;
}
