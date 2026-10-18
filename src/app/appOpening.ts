let opened = false;

/** True only for the first navigation of the session, when the app opens. */
export function consumeAppOpening(): boolean {
  const opening = !opened;
  opened = true;
  return opening;
}

export function resetAppOpening(): void {
  opened = false;
}
