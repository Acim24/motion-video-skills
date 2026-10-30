import React from 'react';
import {useCurrentFrame} from 'remotion';
import {FeatureListScene, Timed} from '../types';
import {palette, fonts} from '../theme';
import {reveal, exitOpacity, useLayout} from '../lib/anim';
import {Sfx} from '../audio/Sfx';
import {Frame, Eyebrow} from '../lib/Frame';

// Numbered list of capabilities; items cascade in. Grid at 16:9, single column at 9:16.
export const Features: React.FC<Timed<FeatureListScene>> = ({eyebrow, title, items, tone = 'light', durationInFrames}) => {
  const frame = useCurrentFrame();
  const {s, vertical} = useLayout();
  const c = palette[tone];
  const cols = vertical ? 1 : Math.min(items.length, 3);

  return (
    <Frame tone={tone}>
      <div style={{opacity: exitOpacity(frame, durationInFrames)}}>
        {eyebrow && <Eyebrow text={eyebrow} tone={tone} style={{marginBottom: 24 * s, ...reveal(frame, 0, {scale: s})}} />}
        <div style={{fontFamily: fonts.serif, fontSize: (vertical ? 88 : 80) * s, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 72 * s, ...reveal(frame, 4, {scale: s})}}>
          {title}
        </div>
        <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: (vertical ? 48 : 56) * s}}>
          {items.map((it, i) => (
            <div key={it.title} style={{borderTop: `${2 * s}px solid ${c.line}`, paddingTop: 28 * s, ...reveal(frame, 18 + i * 8, {scale: s})}}>
              <div style={{fontFamily: fonts.mono, fontSize: 22 * s, color: c.accent, marginBottom: 14 * s}}>{String(i + 1).padStart(2, '0')}</div>
              <div style={{fontSize: 40 * s, fontWeight: 500, marginBottom: 12 * s}}>{it.title}</div>
              {it.body && <div style={{fontSize: 28 * s, color: c.muted, lineHeight: 1.4}}>{it.body}</div>}
            </div>
          ))}
        </div>
      </div>
      {items.map((it, i) => (
        <Sfx key={it.title} name="pop" at={18 + i * 8} gain={0.55} />
      ))}
    </Frame>
  );
};
