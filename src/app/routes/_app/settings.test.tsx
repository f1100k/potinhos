import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAppData } from '../../../stores/appData';
import { createInitialData } from '../../../stores/appReducer';
import { exportFile } from '../../../stores/persistence/schema';
import { STORAGE_KEY } from '../../../stores/persistence/storage';
import { TODAY } from '../../../testing/fixtures';
import { renderApp } from '../../../testing/renderApp';
import { seedData } from '../../../testing/seedData';
import type { Task } from '../../../types/model';

const DISHES: Task = { id: 'a', text: 'Lavar a louça', jar: 'simple' };
const PLANTS: Task = { id: 'b', text: 'Regar as plantas', jar: 'simple' };

function exportedFile(tasks: Task[]) {
  const data = { ...createInitialData(TODAY), tasks };
  return new File([exportFile(data, TODAY)], 'potinhos-2026-10-14.json', {
    type: 'application/json',
  });
}

async function importFile(file: File) {
  await userEvent.upload(screen.getByLabelText('Arquivo para importar'), file);
}

describe('Settings', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    localStorage.clear();
  });
  afterEach(() => vi.useRealTimers());

  it('turns the paper sounds off and keeps the choice', async () => {
    seedData(TODAY);
    await renderApp('/settings');
    const toggle = screen.getByRole('switch', { name: /Sons de papel/ });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject(
      { settings: { sounds: false } },
    );
  });

  it('downloads the data as a dated JSON file', async () => {
    seedData(TODAY, { tasks: [DISHES] });
    URL.createObjectURL = vi.fn(() => 'blob:potinhos');
    URL.revokeObjectURL = vi.fn();
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
    await renderApp('/settings');
    await userEvent.click(
      screen.getByRole('button', { name: 'Baixar meus dados' }),
    );

    const [blob] = vi.mocked(URL.createObjectURL).mock.calls[0] ?? [];
    expect(JSON.parse(await (blob as Blob).text())).toMatchObject({
      exportedAt: expect.any(String),
      tasks: [DISHES],
    });
    expect(click.mock.contexts[0]).toHaveProperty(
      'download',
      'potinhos-2026-10-14.json',
    );
    expect(
      await screen.findByText('Seus papeizinhos foram baixados em um arquivo.'),
    ).toBeVisible();
    click.mockRestore();
  });

  it('imports straight away when this device is empty', async () => {
    seedData(TODAY);
    await renderApp('/settings');
    await importFile(exportedFile([DISHES]));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(useAppData.getState().tasks).toEqual([DISHES]);
    expect(
      await screen.findByText('Pronto, seus papeizinhos chegaram.'),
    ).toBeVisible();
  });

  it('asks whether to merge or replace when there is data here', async () => {
    seedData(TODAY, { tasks: [DISHES] });
    await renderApp('/settings');
    await importFile(exportedFile([DISHES, PLANTS]));
    const dialog = await screen.findByRole('dialog', {
      name: 'Como quer importar?',
    });
    expect(dialog).toHaveTextContent(
      'O arquivo tem 2 papeizinhos e 0 conquistas.',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Juntar com os daqui' }),
    );
    expect(useAppData.getState().tasks).toEqual([DISHES, PLANTS]);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('replaces everything when asked', async () => {
    seedData(TODAY, { tasks: [DISHES] });
    await renderApp('/settings');
    await importFile(exportedFile([PLANTS]));
    await userEvent.click(
      await screen.findByRole('button', { name: 'Trocar tudo pelo arquivo' }),
    );
    expect(useAppData.getState().tasks).toEqual([PLANTS]);
  });

  it('is gentle with a file that is not from the app', async () => {
    seedData(TODAY, { tasks: [DISHES] });
    await renderApp('/settings');
    await importFile(
      new File(['oi'], 'foto.json', { type: 'application/json' }),
    );
    expect(
      await screen.findByText(
        'Não consegui ler esse arquivo. Ele foi baixado do Potinhos?',
      ),
    ).toBeVisible();
    expect(useAppData.getState().tasks).toEqual([DISHES]);
  });

  it('deletes everything only after confirming', async () => {
    seedData(TODAY, { tasks: [DISHES] });
    const router = await renderApp('/settings');
    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    expect(
      screen.getByRole('dialog', { name: 'Apagar tudo mesmo?' }),
    ).toBeVisible();
    await userEvent.click(screen.getByRole('button', { name: 'Melhor não' }));
    expect(useAppData.getState().tasks).toEqual([DISHES]);

    await userEvent.click(screen.getByRole('button', { name: 'Apagar tudo' }));
    const [, confirm] = screen.getAllByRole('button', { name: 'Apagar tudo' });
    if (!confirm) throw new Error('no confirm button');
    await userEvent.click(confirm);
    expect(useAppData.getState().tasks).toEqual([]);
    expect(router.state.location.pathname).toBe('/jars');
    expect(
      await screen.findByText(
        'Tudo limpinho. Quando quiser, é só começar de novo.',
      ),
    ).toBeVisible();
  });

  it('links to the landing page and to the coffee page', async () => {
    seedData(TODAY);
    await renderApp('/settings');
    expect(
      screen.getByRole('link', { name: /Sobre o Potinhos/ }),
    ).toHaveAttribute('href', '/');
    expect(
      screen.getByRole('link', { name: /Me paga um café\?.*sempre/ }),
    ).toHaveAttribute('href', '/coffee?from=app');
  });

  it('explains when each sound plays', async () => {
    seedData(TODAY);
    await renderApp('/settings');
    expect(screen.getByText(/Nenhum som de erro/)).toBeVisible();
  });
});
