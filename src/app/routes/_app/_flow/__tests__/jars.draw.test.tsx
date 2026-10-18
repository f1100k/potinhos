import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DISHES, TODAY, waitMs } from '../../../../../testing/fixtures';
import { renderApp } from '../../../../../testing/renderApp';
import { seedData } from '../../../../../testing/seedData';

describe('Draw', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('shakes the jar, unfolds the slip and opens the task', async () => {
    seedData(TODAY, { tasks: [DISHES] });
    const router = await renderApp('/jars');
    await userEvent.click(
      screen.getByRole('button', { name: 'Pote Simples, 1 papelzinho' }),
    );

    expect(
      await screen.findByText('Deixa eu ver o que tem aqui…'),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Sorteado agora. Não dá para sortear de novo, e tudo bem.',
      ),
    ).toBeVisible();
    expect(screen.queryByText('Lavar a louça')).toBeNull();

    await waitMs(900);
    expect(screen.getByText('Saiu um papelzinho.')).toBeVisible();

    await waitMs(1500);
    expect(screen.getByText('Olha só o que veio.')).toBeVisible();
    expect(screen.getByText('Lavar a louça')).toBeInTheDocument();

    await waitMs(1600);
    expect(router.state.location.pathname).toBe('/jars/task');
  });
});
