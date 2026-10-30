import type {Tone} from './theme';

type Base = {
  /**
   * Scene length in frames (30 fps → 90 = 3 s). Optional when `vo` is set:
   * the scene is then sized to fit the narration. If both are set and the
   * narration is longer, the scene is stretched to fit it.
   */
  durationInFrames?: number;
  tone?: Tone;
  /** Voice-over line spoken during this scene (generated with edge-tts by `npm run audio`). */
  vo?: string;
};

// Text fields support *asterisks* to mark accent words (italic serif in the accent color).
export type HeadlineScene = Base & {
  type: 'headline';
  eyebrow?: string;
  lines: string[];
  sub?: string;
};

export type ChatScene = Base & {
  type: 'chat';
  title?: string;
  prompt: string;
  response: string;
  /** Label shown above the reply, e.g. the product name. */
  assistantName?: string;
};

export type BenchmarkScene = Base & {
  type: 'benchmark';
  eyebrow?: string;
  title: string;
  unit?: string;
  bars: {label: string; value: number; highlight?: boolean}[];
  max?: number;
  footnote?: string;
};

export type BigNumberScene = Base & {
  type: 'bigNumber';
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
};

export type FeatureListScene = Base & {
  type: 'features';
  eyebrow?: string;
  title: string;
  items: {title: string; body?: string}[];
};

export type LogoScene = Base & {
  type: 'logo';
  name: string;
  tagline?: string;
  /** Optional image in public/, e.g. "logo.svg". Without it a neutral mark is drawn. */
  logoSrc?: string;
  cta?: string;
};

export type Scene =
  | HeadlineScene
  | ChatScene
  | BenchmarkScene
  | BigNumberScene
  | FeatureListScene
  | LogoScene;

export type AudioSettings = {
  /**
   * 'generated' = an original ambient score synthesized to fit the timeline,
   * a file name in public/ (e.g. 'music.mp3') = your own track, 'none' = silence.
   */
  music: 'generated' | 'none' | (string & {});
  /** Musical key root for the generated score, e.g. 'D', 'F#', 'Bb'. */
  key?: string;
  musicVolume: number;
  /** Music level multiplier while the voice-over speaks (0.25 = duck to a quarter). */
  duckTo: number;
  /** Synced UI sound effects (whooshes, ticks, typing, impacts). */
  sfx: boolean;
  sfxVolume: number;
  /** edge-tts voice, e.g. 'id-ID-GadisNeural', 'id-ID-ArdiNeural', 'en-US-AndrewNeural'. */
  voice: string;
  /** edge-tts speaking rate, e.g. '-5%', '+0%', '+10%'. */
  voiceRate?: string;
  voiceVolume: number;
};

export type Storyboard = {
  fps: number;
  /** Frames of cross-fade between consecutive scenes. */
  transitionFrames: number;
  audio: AudioSettings;
  scenes: Scene[];
};

/** A scene with its final length and absolute start frame. */
export type TimedScene = Scene & {durationInFrames: number; from: number; index: number};

/** Props a scene component receives: its final length is always known. */
export type Timed<T> = T & {durationInFrames: number};
