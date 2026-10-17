import { describe, expect, it } from 'vitest';

describe('ambiente de testes', () => {
  it('roda o Vitest com jsdom', () => {
    const div = document.createElement('div');
    div.textContent = 'Potinhos';
    document.body.append(div);
    expect(div).toBeInTheDocument();
  });
});
