import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, Img, staticFile, interpolate} from 'remotion';
import {LogoScene, Timed} from '../types';
import {palette, fonts} from '../theme';
import {reveal, useLayout, progress} from '../lib/anim';
import {Sfx} from '../audio/Sfx';
import {Frame} from '../lib/Frame';

// Outro: a mark draws itself (or the user's logo scales in), then the wordmark tightens into place.
export const Logo: React.FC<Timed<LogoScene>> = ({name, tagline, logoSrc, cta, tone = 'dark'}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {s} = useLayout();
  const c = palette[tone];

  const pop = spring({frame, fps, config: {damping: 200}});
  const draw = progress(frame, 0, 30);
  const size = 150 * s;
  const R = 44;
  const circ = 2 * Math.PI * R;
  const tracking = interpolate(progress(frame, 14, 36), [0, 1], [0.3, -0.02]);

  return (
    <Frame tone={tone}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
        <div style={{width: size, height: size, marginBottom: 48 * s, transform: `scale(${0.8 + pop * 0.2})`, opacity: pop}}>
          {logoSrc ? (
            <Img src={staticFile(logoSrc)} style={{width: '100%', height: '100%', objectFit: 'contain'}} />
          ) : (
            <svg viewBox="0 0 100 100" width="100%" height="100%">
              <circle cx="50" cy="50" r={R} fill="none" stroke={c.accent} strokeWidth="5" strokeDasharray={circ} strokeDashoffset={circ * (1 - draw)} strokeLinecap="round" transform="rotate(-90 50 50)" />
              <circle cx="50" cy="50" r={14 * progress(frame, 18, 16)} fill={c.accent} />
            </svg>
          )}
        </div>
        <div style={{fontFamily: fonts.serif, fontSize: 140 * s, lineHeight: 1, letterSpacing: `${tracking}em`, ...reveal(frame, 12, {scale: s, blur: 12})}}>{name}</div>
        {tagline && <div style={{marginTop: 32 * s, fontSize: 40 * s, color: c.muted, ...reveal(frame, 34, {scale: s})}}>{tagline}</div>}
        {cta && (
          <div style={{marginTop: 56 * s, fontFamily: fonts.mono, fontSize: 26 * s, letterSpacing: '0.08em', color: c.accent, border: `${1.5 * s}px solid ${c.accent}`, borderRadius: 999, padding: `${16 * s}px ${36 * s}px`, ...reveal(frame, 46, {scale: s})}}>
            {cta}
          </div>
        )}
      </div>
      <Sfx name="impact" at={0} />
      <Sfx name="shimmer" at={12} gain={0.8} />
    </Frame>
  );
};
