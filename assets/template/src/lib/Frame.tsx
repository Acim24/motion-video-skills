import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {palette, Tone, fonts} from '../theme';
import {useLayout} from './anim';

// Shared scene background: flat paper color + very subtle slow drift of a grain-free vignette.
export const Frame: React.FC<{tone?: Tone; children: React.ReactNode}> = ({tone = 'light', children}) => {
  const c = palette[tone];
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const {pad} = useLayout();
  const drift = interpolate(frame, [0, durationInFrames], [0, 6]);
  return (
    <AbsoluteFill
      style={{
        backgroundColor: c.bg,
        backgroundImage: `radial-gradient(ellipse at ${50 + drift}% ${40 - drift}%, ${c.surface} 0%, ${c.bg} 70%)`,
        color: c.ink,
        fontFamily: fonts.sans,
        padding: pad,
        justifyContent: 'center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const Eyebrow: React.FC<{text: string; tone?: Tone; style?: React.CSSProperties}> = ({text, tone = 'light', style}) => {
  const {s} = useLayout();
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize: 24 * s,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: palette[tone].accent,
        ...style,
      }}
    >
      {text}
    </div>
  );
};
