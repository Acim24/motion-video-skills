import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BigNumberScene, Timed} from '../types';
import {palette, fonts} from '../theme';
import {reveal, exitOpacity, useLayout, progress} from '../lib/anim';
import {Sfx} from '../audio/Sfx';
import {Frame} from '../lib/Frame';

// One huge stat that counts up, with a label underneath.
export const BigNumber: React.FC<Timed<BigNumberScene>> = ({value, prefix = '', suffix = '', decimals = 0, label, tone = 'light', durationInFrames}) => {
  const frame = useCurrentFrame();
  const {s, vertical} = useLayout();
  const c = palette[tone];
  const countFrames = Math.round(Math.min(50, durationInFrames * 0.5));
  const p = progress(frame, 6, countFrames);
  const shown = (value * p).toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals});

  return (
    <Frame tone={tone}>
      <div style={{opacity: exitOpacity(frame, durationInFrames), textAlign: 'center'}}>
        <div
          style={{
            fontFamily: fonts.serif,
            fontSize: (vertical ? 300 : 340) * s,
            lineHeight: 1,
            letterSpacing: '-0.04em',
            fontVariantNumeric: 'tabular-nums',
            ...reveal(frame, 0, {scale: s, distance: 40}),
          }}
        >
          <span style={{color: c.muted}}>{prefix}</span>
          {shown}
          <span style={{color: c.accent, fontStyle: 'italic'}}>{suffix}</span>
        </div>
        <div style={{marginTop: 36 * s, fontSize: 44 * s, color: c.muted, lineHeight: 1.3, ...reveal(frame, 26, {scale: s})}}>{label}</div>
      </div>
      <Sfx name="count" at={6} length={countFrames} gain={0.45} />
      <Sfx name="impact" at={6 + countFrames - 2} gain={0.7} />
    </Frame>
  );
};
