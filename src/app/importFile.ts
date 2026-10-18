import { InvalidDataError, parseData } from '../domain/persistence/schema';
import type { AppData } from '../domain/types';

type ImportResult =
  | { kind: 'ok'; data: AppData }
  | { kind: 'error'; message: string };

const UNREADABLE =
  'Não consegui ler esse arquivo. Ele foi baixado do Potinhos?';
const NEWER_VERSION =
  'Esse arquivo veio de uma versão mais nova do Potinhos. Atualize o app e tente de novo.';

export async function readImportFile(
  file: Blob,
  now: Date,
): Promise<ImportResult> {
  try {
    return { kind: 'ok', data: parseData(JSON.parse(await file.text()), now) };
  } catch (error) {
    const newer =
      error instanceof InvalidDataError && error.reason === 'newerVersion';
    return { kind: 'error', message: newer ? NEWER_VERSION : UNREADABLE };
  }
}
