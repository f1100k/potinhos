// Web Audio instead of <audio>: on iOS it follows the silent switch, and the
// "ambient" session mixes with music already playing instead of stopping it.

type AudioSessionNavigator = Navigator & { audioSession?: { type: string } };

let context: AudioContext | null = null;
const bytes = new Map<string, Promise<ArrayBuffer | null>>();
const decoded = new Map<string, Promise<AudioBuffer | null>>();

function fetchBytes(url: string): Promise<ArrayBuffer | null> {
  let pending = bytes.get(url);
  if (!pending) {
    pending = fetch(url)
      .then((response) => (response.ok ? response.arrayBuffer() : null))
      .catch(() => null);
    bytes.set(url, pending);
  }
  return pending;
}

function decode(audio: AudioContext, url: string): Promise<AudioBuffer | null> {
  let pending = decoded.get(url);
  if (!pending) {
    pending = fetchBytes(url)
      .then((data) => (data ? audio.decodeAudioData(data) : null))
      .catch(() => null);
    decoded.set(url, pending);
  }
  return pending;
}

/** Downloads the files without an AudioContext, which needs a gesture. */
export function preloadSounds(urls: readonly string[]): void {
  for (const url of urls) void fetchBytes(url);
}

function resumeAudio(): void {
  if (!globalThis.AudioContext) return;
  if (!context) {
    const session = (navigator as AudioSessionNavigator).audioSession;
    if (session) session.type = 'ambient';
    context = new AudioContext();
  }
  if (context.state !== 'running') void context.resume().catch(() => {});
}

// Browsers only start audio inside a user gesture, and iOS suspends it again
// when the app goes to the background, so every gesture tries to resume it.
export function resumeAudioOnGestures(
  target: EventTarget = window,
): () => void {
  const options = { capture: true, passive: true };
  target.addEventListener('pointerdown', resumeAudio, options);
  target.addEventListener('keydown', resumeAudio, options);
  return () => {
    target.removeEventListener('pointerdown', resumeAudio, options);
    target.removeEventListener('keydown', resumeAudio, options);
  };
}

/** Plays `url` after `delayMs`; the returned function stops it. */
export function playSound(
  url: string,
  volume: number,
  delayMs = 0,
): () => void {
  const audio = context;
  // Still "suspended" right after the first gesture: what starts now plays as
  // soon as resume() finishes.
  if (!audio || audio.state === 'closed') return () => {};
  const startAt = audio.currentTime + delayMs / 1000;
  let source: AudioBufferSourceNode | null = null;
  let stopped = false;

  void decode(audio, url).then((buffer) => {
    if (!buffer || stopped) return;
    const gain = audio.createGain();
    gain.gain.value = volume;
    gain.connect(audio.destination);
    source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(gain);
    source.start(Math.max(startAt, audio.currentTime));
  });

  return () => {
    stopped = true;
    source?.stop();
  };
}
