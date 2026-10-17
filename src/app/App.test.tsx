import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('abre na landing', () => {
    render(<App />);
    expect(
      screen.getByRole('heading', { name: 'Como funciona' }),
    ).toBeInTheDocument();
  });

  it('troca de tela pela barra de dev', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: 'settings' }));
    expect(
      screen.getByRole('heading', { name: 'Configurações' }),
    ).toBeInTheDocument();
  });
});
