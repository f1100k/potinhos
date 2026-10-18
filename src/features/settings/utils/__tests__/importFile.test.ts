import { describe, expect, it } from 'vitest';
import { createInitialData } from '../../../../stores/appReducer';
import { exportFile } from '../../../../stores/persistence/schema';
import { readImportFile } from '../importFile';

const NOW = new Date(2026, 9, 14, 10);

const fileWith = (text: string) => new Blob([text]);

describe('readImportFile', () => {
  it('reads a file exported by the app', async () => {
    const data = {
      ...createInitialData(NOW),
      tasks: [{ id: 'a', text: 'Lavar a louça', jar: 'simple' as const }],
    };
    expect(await readImportFile(fileWith(exportFile(data, NOW)), NOW)).toEqual({
      kind: 'ok',
      data,
    });
  });

  it('is gentle with a file that is not from the app', async () => {
    for (const text of ['não é json', '{"foo": 1}']) {
      expect(await readImportFile(fileWith(text), NOW)).toEqual({
        kind: 'error',
        message: 'Não consegui ler esse arquivo. Ele foi baixado do Potinhos?',
      });
    }
  });

  it('asks to update the app for a file from a newer version', async () => {
    const result = await readImportFile(
      fileWith('{"version": 99, "tasks": []}'),
      NOW,
    );
    expect(result).toMatchObject({
      kind: 'error',
      message: expect.stringMatching(/versão mais nova/),
    });
  });
});
