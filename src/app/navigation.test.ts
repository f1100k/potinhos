import { describe, expect, it } from 'vitest';
import { FLOW_SCREENS, initialNav, navReducer, SCREENS } from './navigation';

describe('navReducer', () => {
  it('começa na landing', () => {
    expect(initialNav.route).toEqual({ screen: 'landing' });
  });

  it('vai para a rota pedida, com parâmetros', () => {
    const next = navReducer(initialNav, {
      type: 'go',
      route: { screen: 'draw', pote: 'semanal' },
    });
    expect(next.route).toEqual({ screen: 'draw', pote: 'semanal' });
  });

  it('tem as 16 telas', () => {
    expect(SCREENS).toHaveLength(16);
  });

  it('as telas do fluxo são telas válidas', () => {
    for (const s of FLOW_SCREENS) expect(SCREENS).toContain(s);
  });
});
