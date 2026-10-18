import { describe, expect, it } from 'vitest';
import { pixCode } from './pixCode';

describe('pixCode', () => {
  it('matches the example of the Banco Central manual', () => {
    expect(
      pixCode({
        key: '123e4567-e12b-12d1-a456-426655440000',
        name: 'Fulano de Tal',
        city: 'BRASILIA',
      }),
    ).toBe(
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D',
    );
  });

  it('writes a CPF key with its length', () => {
    const code = pixCode({
      key: '44478007802',
      name: 'POTINHOS',
      city: 'BRASIL',
    });
    expect(code).toContain('0014br.gov.bcb.pix011144478007802');
    expect(code).toContain('5908POTINHOS6006BRASIL');
    expect(code).toMatch(/6304[0-9A-F]{4}$/);
  });
});
