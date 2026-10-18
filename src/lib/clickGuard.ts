// Capturing on the document runs before React's listener on the root, so the
// click never reaches the app.
export function swallowClicksFor(ms: number): void {
  const until = Date.now() + ms;
  const stopListening = () =>
    document.removeEventListener('click', swallow, true);
  function swallow(event: MouseEvent) {
    if (Date.now() >= until) {
      stopListening();
      return;
    }
    event.stopPropagation();
    event.preventDefault();
  }
  document.addEventListener('click', swallow, true);
  setTimeout(stopListening, ms);
}
