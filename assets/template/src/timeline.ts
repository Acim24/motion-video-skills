import type {Scene, Storyboard, TimedScene} from './types';

export type AudioManifest = {
  /** Path in public/ of the music bed, or null when none was built. */
  music: string | null;
  /** Voice-over clips by scene index: file in public/ and its length in seconds. */
  vo: Record<string, {file: string; seconds: number}>;
};

// Frames before the narration starts and after it ends inside its scene.
export const VO_LEAD = 10;
const VO_TAIL = 20;

const DEFAULT_LENGTH: Record<Scene['type'], number> = {
  headline: 90,
  chat: 180,
  benchmark: 150,
  bigNumber: 90,
  features: 135,
  logo: 105,
};

// Pure (no Remotion imports) so the audio build script can share it with the video.
export const resolveTimeline = (sb: Storyboard, manifest: AudioManifest): TimedScene[] => {
  let from = 0;
  return sb.scenes.map((scene, index) => {
    const vo = scene.vo ? manifest.vo[index] : undefined;
    const voFrames = vo ? Math.ceil(vo.seconds * sb.fps) + VO_LEAD + VO_TAIL : 0;
    const durationInFrames = Math.max(scene.durationInFrames ?? DEFAULT_LENGTH[scene.type], voFrames);
    const timed = {...scene, durationInFrames, from, index} as TimedScene;
    from += durationInFrames - sb.transitionFrames;
    return timed;
  });
};

export const totalFrames = (sb: Storyboard, timeline: TimedScene[]) =>
  timeline.reduce((n, s) => n + s.durationInFrames, 0) - sb.transitionFrames * Math.max(0, timeline.length - 1);
