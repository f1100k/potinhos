import { describe, expect, it, vi } from 'vitest';
import { requestPersistentStorage } from '../persistentStorage';

function storageManager(persisted: boolean, granted = true) {
  return {
    persisted: vi.fn(async () => persisted),
    persist: vi.fn(async () => granted),
  } as unknown as StorageManager;
}

describe('requestPersistentStorage', () => {
  it('asks for persistence when the storage is not persistent yet', async () => {
    const storage = storageManager(false);
    expect(await requestPersistentStorage(storage)).toBe(true);
    expect(storage.persist).toHaveBeenCalledOnce();
  });

  it('does not ask again when the storage is already persistent', async () => {
    const storage = storageManager(true);
    expect(await requestPersistentStorage(storage)).toBe(true);
    expect(storage.persist).not.toHaveBeenCalled();
  });

  it('reports a refusal', async () => {
    expect(await requestPersistentStorage(storageManager(false, false))).toBe(
      false,
    );
  });

  it('works without the Storage API', async () => {
    expect(await requestPersistentStorage(undefined)).toBe(false);
  });

  it('swallows errors from the browser', async () => {
    const storage = {
      persisted: vi.fn(async () => {
        throw new Error('denied');
      }),
      persist: vi.fn(),
    } as unknown as StorageManager;
    expect(await requestPersistentStorage(storage)).toBe(false);
  });
});
