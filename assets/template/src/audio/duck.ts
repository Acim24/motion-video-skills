import {interpolate} from 'remotion';

// Music gain at `frame`: 1 normally, `duckTo` while any voice-over interval is active,
// with short ramps so the dip is felt rather than heard.
export const duckGain = (frame: number, intervals: [number, number][], duckTo: number, ramp = 8) => {
  let g = 1;
  for (const [a, b] of intervals) {
    const v = interpolate(frame, [a - ramp, a, b, b + ramp * 2], [1, duckTo, duckTo, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    g = Math.min(g, v);
  }
  return g;
};
