import { describe, expect, it } from 'vitest';
import { initialNav, navReducer, SCREENS } from './navigation';

describe('navReducer', () => {
  it('começa na landing', () => {
    expect(initialNav.screen).toBe('landing');
  });

  it('vai para a tela pedida', () => {
    const next = navReducer(initialNav, { type: 'go', screen: 'home' });
    expect(next.screen).toBe('home');
  });

  it('mantém o mesmo objeto quando a tela não muda', () => {
    expect(navReducer(initialNav, { type: 'go', screen: 'landing' })).toBe(
      initialNav,
    );
  });

  it('tem as 16 telas', () => {
    expect(SCREENS).toHaveLength(16);
  });
});
