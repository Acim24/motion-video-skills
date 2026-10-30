import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {HeadlineScene, Timed} from '../types';
import {palette, fonts} from '../theme';
import {reveal, exitOpacity, useLayout, progress} from '../lib/anim';
import {Sfx} from '../audio/Sfx';
import {Frame, Eyebrow} from '../lib/Frame';
import {tokenize, accentStyle} from '../lib/RichText';

// Kinetic typography: words rise in one by one, then the whole block slowly pushes in.
export const Headline: React.FC<Timed<HeadlineScene>> = ({eyebrow, lines, sub, tone = 'light', durationInFrames}) => {
  const frame = useCurrentFrame();
  const {s, vertical} = useLayout();
  const c = palette[tone];

  const longest = Math.max(...lines.map((l) => l.replace(/\*/g, '').length));
  // Shrink type for long lines so nothing wraps awkwardly.
  const base = vertical ? 132 : 150;
  const fontSize = Math.min(base, (vertical ? 1500 : 2600) / Math.max(longest, 8)) * s;

  const STAGGER = 4;
  const firstWordAt = eyebrow ? 10 : 4;
  let i = 0;
  const totalWords = lines.reduce((n, l) => n + tokenize(l).length, 0);
  const subAt = firstWordAt + totalWords * STAGGER + 8;
  const push = interpolate(frame, [0, durationInFrames], [1, 1.035]);
  const accentIdx = lines.flatMap(tokenize).findIndex((t) => t.accent);

  return (
    <Frame tone={tone}>
      <div
        style={{
          opacity: exitOpacity(frame, durationInFrames),
          transform: `scale(${push})`,
          textAlign: vertical ? 'left' : 'center',
        }}
      >
        {eyebrow && <Eyebrow text={eyebrow} tone={tone} style={{marginBottom: 36 * s, ...reveal(frame, 0, {scale: s})}} />}
        {lines.map((line, li) => (
          <div
            key={li}
            style={{
              fontFamily: fonts.serif,
              fontWeight: 400,
              fontSize,
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
            }}
          >
            {tokenize(line).map((t, wi) => {
              const at = firstWordAt + i++ * STAGGER;
              return (
                <span
                  key={wi}
                  style={{display: 'inline-block', marginRight: '0.24em', ...reveal(frame, at, {scale: s}), ...(t.accent ? accentStyle(c.accent) : {})}}
                >
                  {t.word}
                </span>
              );
            })}
          </div>
        ))}
        {sub && (
          <div
            style={{
              marginTop: 40 * s,
              fontSize: 40 * s,
              color: c.muted,
              maxWidth: vertical ? undefined : 1400 * s,
              marginLeft: vertical ? 0 : 'auto',
              marginRight: vertical ? 0 : 'auto',
              lineHeight: 1.35,
              ...reveal(frame, subAt, {scale: s}),
            }}
          >
            {sub}
          </div>
        )}
        <div
          style={{
            height: 3 * s,
            background: c.accent,
            marginTop: 48 * s,
            width: `${progress(frame, subAt, 30) * (vertical ? 30 : 12)}%`,
            marginLeft: vertical ? 0 : 'auto',
            marginRight: vertical ? 0 : 'auto',
          }}
        />
      </div>
      <Sfx name="tick" at={firstWordAt} gain={0.5} />
      {accentIdx >= 0 && <Sfx name="shimmer" at={firstWordAt + accentIdx * STAGGER} gain={0.7} />}
    </Frame>
  );
};
