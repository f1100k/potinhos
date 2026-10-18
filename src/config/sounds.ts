type Sound = { url: string; volume: number };

function sound(file: string, volume = 1): Sound {
  return { url: `${import.meta.env.BASE_URL}sounds/${file}`, volume };
}

// The files share the same loudness, so these only express intent.
const SOFTER = 0.5;

export const SOUNDS = {
  drawRustle: sound('draw-rustle.mp3'),
  drawUnfold: sound('draw-unfold.mp3'),
  doneFold: sound('done-fold.mp3'),
  doneTap: sound('done-tap.mp3'),
  slipDrop2: sound('slip-drop-2.mp3', SOFTER),
  slipDrop3: sound('slip-drop-3.mp3', SOFTER),
} as const satisfies Record<string, Sound>;

export type SoundName = keyof typeof SOUNDS;
