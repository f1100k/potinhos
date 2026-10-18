// Flags that live for one page load. They are not part of AppData because
// reloading the page must reset them.
let appOpened = false;
let flowUnlocked = false;
let weekendAsked = false;

/** True only for the first navigation of the session, when the app opens. */
export function consumeAppOpening(): boolean {
  const opening = !appOpened;
  appOpened = true;
  return opening;
}

// The draw flow only opens through an action inside the app. Reloading the
// page or going back to a flow screen with the browser leads to the jars.
export function unlockFlow(): void {
  flowUnlocked = true;
}

export function consumeFlowUnlock(): boolean {
  const ok = flowUnlocked;
  flowUnlocked = false;
  return ok;
}

// The weekend screen opens by itself once per session. After "Depois", the
// home card is enough: insisting would go against the product.
export function consumeWeekendAsk(): boolean {
  const first = !weekendAsked;
  weekendAsked = true;
  return first;
}

export function resetSession(): void {
  appOpened = false;
  flowUnlocked = false;
  weekendAsked = false;
}
