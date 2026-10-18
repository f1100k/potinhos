// Without this, the browser may evict localStorage under storage pressure, and
// the app has no other copy of the data. Firefox asks the user, so it is only
// requested once the person has started using the app.
export async function requestPersistentStorage(
  storage: StorageManager | undefined = globalThis.navigator?.storage,
): Promise<boolean> {
  try {
    if (!storage?.persist) return false;
    if (await storage.persisted()) return true;
    return await storage.persist();
  } catch {
    return false;
  }
}
