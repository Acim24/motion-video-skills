import {Easing, interpolate, useVideoConfig} from 'remotion';

// Long, soft deceleration — the signature "calm" feel. Avoid bouncy springs.
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const progress = (
  frame: number,
  start: number,
  duration: number,
  easing: (t: number) => number = easeOut,
) =>
  interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

// Fade + rise + de-blur. `distance` is in design pixels (multiplied by scale).
export const reveal = (
  frame: number,
  start: number,
  opts: {duration?: number; distance?: number; blur?: number; scale?: number} = {},
): React.CSSProperties => {
  const {duration = 22, distance = 28, blur = 8, scale = 1} = opts;
  const p = progress(frame, start, duration);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance * scale}px)`,
    filter: blur ? `blur(${(1 - p) * blur * scale}px)` : undefined,
  };
};

// Fade everything out over the last few frames of a scene so cuts never feel abrupt.
export const exitOpacity = (frame: number, duration: number, length = 12) =>
  interpolate(frame, [duration - length, duration], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

// Layout scale relative to a 1080px short edge, so one design works at 16:9 and 9:16.
export const useLayout = () => {
  const {width, height} = useVideoConfig();
  const s = Math.min(width, height) / 1080;
  const vertical = height > width;
  return {width, height, s, vertical, pad: (vertical ? 80 : 120) * s};
};
