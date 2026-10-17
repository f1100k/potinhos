import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('abre na landing', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Como funciona' }),
    ).toBeInTheDocument();
  });

  it('abre na rota pedida', () => {
    render(<App initialRoute={{ screen: 'settings' }} />);
    expect(
      screen.getByRole('heading', { name: 'Configurações' }),
    ).toBeInTheDocument();
  });
});
