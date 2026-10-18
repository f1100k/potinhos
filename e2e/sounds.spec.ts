import { expect, test } from '@playwright/test';

const FILES = [
  'draw-rustle',
  'draw-unfold',
  'done-fold',
  'done-tap',
  'return-rustle',
  'slip-drop-1',
  'slip-drop-2',
  'slip-drop-3',
];

test('every sound file decodes in the browser', async ({ page }) => {
  await page.goto('/');
  const durations = await page.evaluate(async (names) => {
    const audio = new OfflineAudioContext(2, 1, 48_000);
    return Promise.all(
      names.map(async (name) => {
        const response = await fetch(`/sounds/${name}.mp3`);
        const buffer = await audio.decodeAudioData(
          await response.arrayBuffer(),
        );
        return buffer.duration;
      }),
    );
  }, FILES);
  for (const duration of durations) {
    expect(duration).toBeGreaterThan(0.1);
    expect(duration).toBeLessThan(2);
  }
});
