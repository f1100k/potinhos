import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

class FakeAudioContext {
  static instances: FakeAudioContext[] = [];
  state: AudioContextState = 'suspended';
  currentTime = 10;
  destination = {};
  started: { buffer: unknown; when: number; volume: number }[] = [];
  stopped = 0;

  constructor() {
    FakeAudioContext.instances.push(this);
  }

  resume = vi.fn(async () => {
    this.state = 'running';
  });

  decodeAudioData = vi.fn(async (data: ArrayBuffer) => ({ decodedFrom: data }));

  createGain() {
    return { gain: { value: 1 }, connect: () => {} };
  }

  createBufferSource() {
    const source = {
      buffer: null as unknown,
      gain: null as { gain: { value: number } } | null,
      connect: (gain: { gain: { value: number } }) => {
        source.gain = gain;
      },
      start: (when: number) =>
        this.started.push({
          buffer: source.buffer,
          when,
          volume: source.gain?.gain.value ?? 1,
        }),
      stop: () => {
        this.stopped += 1;
      },
    };
    return source;
  }
}

async function loadAudio() {
  vi.resetModules();
  return import('../audio');
}

function tap(target: EventTarget) {
  target.dispatchEvent(new Event('pointerdown'));
}

describe('audio', () => {
  beforeEach(() => {
    FakeAudioContext.instances = [];
    vi.stubGlobal('AudioContext', FakeAudioContext);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => ({
        ok: true,
        arrayBuffer: async () => new TextEncoder().encode(url).buffer,
      })),
    );
  });
  afterEach(() => vi.unstubAllGlobals());

  it('stays silent before any gesture', async () => {
    const { playSound } = await loadAudio();
    playSound('/sounds/a.mp3', 1);
    expect(FakeAudioContext.instances).toEqual([]);
  });

  it('preloads without creating an AudioContext', async () => {
    const { preloadSounds } = await loadAudio();
    preloadSounds(['/sounds/a.mp3', '/sounds/a.mp3', '/sounds/b.mp3']);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(FakeAudioContext.instances).toEqual([]);
  });

  it('starts the audio on a gesture and plays at the given delay and volume', async () => {
    const { playSound, resumeAudioOnGestures } = await loadAudio();
    const target = new EventTarget();
    resumeAudioOnGestures(target);
    tap(target);
    const [audio] = FakeAudioContext.instances;
    expect(audio?.resume).toHaveBeenCalledOnce();

    playSound('/sounds/a.mp3', 0.5, 250);
    await vi.waitFor(() => expect(audio?.started).toHaveLength(1));
    expect(audio?.started[0]).toMatchObject({ when: 10.25, volume: 0.5 });
  });

  it('decodes each file once', async () => {
    const { playSound, resumeAudioOnGestures } = await loadAudio();
    const target = new EventTarget();
    resumeAudioOnGestures(target);
    tap(target);
    playSound('/sounds/a.mp3', 1);
    playSound('/sounds/a.mp3', 1);
    const [audio] = FakeAudioContext.instances;
    await vi.waitFor(() => expect(audio?.started).toHaveLength(2));
    expect(audio?.decodeAudioData).toHaveBeenCalledOnce();
  });

  it('does not start a sound stopped while it was loading', async () => {
    const { playSound, resumeAudioOnGestures } = await loadAudio();
    const target = new EventTarget();
    resumeAudioOnGestures(target);
    tap(target);
    const stop = playSound('/sounds/a.mp3', 1);
    stop();
    const [audio] = FakeAudioContext.instances;
    await vi.waitFor(() => expect(audio?.decodeAudioData).toHaveBeenCalled());
    await Promise.resolve();
    expect(audio?.started).toEqual([]);
  });

  it('resumes again on a later gesture after being suspended', async () => {
    const { resumeAudioOnGestures } = await loadAudio();
    const target = new EventTarget();
    const stopListening = resumeAudioOnGestures(target);
    tap(target);
    const [audio] = FakeAudioContext.instances;
    await vi.waitFor(() => expect(audio?.state).toBe('running'));
    if (audio) audio.state = 'suspended';
    tap(target);
    expect(audio?.resume).toHaveBeenCalledTimes(2);
    expect(FakeAudioContext.instances).toHaveLength(1);

    stopListening();
    tap(target);
    expect(audio?.resume).toHaveBeenCalledTimes(2);
  });

  it('plays nothing when the file fails to load', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: false })),
    );
    const { playSound, resumeAudioOnGestures } = await loadAudio();
    const target = new EventTarget();
    resumeAudioOnGestures(target);
    tap(target);
    playSound('/sounds/missing.mp3', 1);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(FakeAudioContext.instances[0]?.started).toEqual([]);
  });
});
