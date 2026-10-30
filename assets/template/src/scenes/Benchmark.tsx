import React from 'react';
import {useCurrentFrame} from 'remotion';
import {BenchmarkScene, Timed} from '../types';
import {palette, fonts} from '../theme';
import {reveal, exitOpacity, useLayout, progress, easeInOut} from '../lib/anim';
import {Sfx} from '../audio/Sfx';
import {Frame, Eyebrow} from '../lib/Frame';

// Horizontal bars grow in sequence; values count up; the highlighted bar is the only one in accent color.
export const Benchmark: React.FC<Timed<BenchmarkScene>> = ({eyebrow, title, unit = '%', bars, max, footnote, tone = 'light', durationInFrames}) => {
  const frame = useCurrentFrame();
  const {s, vertical} = useLayout();
  const c = palette[tone];
  const top = max ?? Math.max(...bars.map((b) => b.value)) * 1.08;
  const decimals = bars.some((b) => !Number.isInteger(b.value)) ? 1 : 0;

  const barsAt = 22;
  const STAGGER = 6;
  const GROW = 34;
  const barH = (vertical ? 64 : 56) * s;
  const highlightIdx = bars.findIndex((b) => b.highlight);

  return (
    <Frame tone={tone}>
      <div style={{opacity: exitOpacity(frame, durationInFrames)}}>
        {eyebrow && <Eyebrow text={eyebrow} tone={tone} style={{marginBottom: 24 * s, ...reveal(frame, 0, {scale: s})}} />}
        <div style={{fontFamily: fonts.serif, fontSize: (vertical ? 84 : 76) * s, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 64 * s, ...reveal(frame, 4, {scale: s})}}>
          {title}
        </div>
        <div style={{display: 'flex', flexDirection: 'column', gap: (vertical ? 44 : 28) * s}}>
          {bars.map((b, i) => {
            const at = barsAt + i * STAGGER;
            const p = progress(frame, at, GROW, easeInOut);
            const color = b.highlight ? c.accent : c.barRest;
            return (
              <div
                key={b.label}
                style={{
                  display: 'flex',
                  flexDirection: vertical ? 'column' : 'row',
                  alignItems: vertical ? 'stretch' : 'center',
                  gap: (vertical ? 14 : 32) * s,
                  ...reveal(frame, at - 6, {scale: s, blur: 0, distance: 12}),
                }}
              >
                <div
                  style={{
                    width: vertical ? undefined : 380 * s,
                    flexShrink: 0,
                    fontSize: 30 * s,
                    fontWeight: b.highlight ? 600 : 400,
                    color: b.highlight ? c.ink : c.muted,
                  }}
                >
                  {b.label}
                </div>
                <div style={{flex: 1, display: 'flex', alignItems: 'center', gap: 24 * s}}>
                  <div style={{flex: 1, height: barH, background: c.line, borderRadius: 10 * s, overflow: 'hidden'}}>
                    <div style={{width: `${(b.value / top) * 100 * p}%`, height: '100%', background: color, borderRadius: 10 * s}} />
                  </div>
                  <div
                    style={{
                      width: 170 * s,
                      textAlign: 'right',
                      fontFamily: fonts.mono,
                      fontSize: 36 * s,
                      fontWeight: 500,
                      color: b.highlight ? c.accent : c.muted,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {(b.value * p).toFixed(decimals)}
                    {unit}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {footnote && (
          <div style={{marginTop: 56 * s, fontSize: 22 * s, color: c.muted, ...reveal(frame, barsAt + bars.length * STAGGER + GROW, {scale: s})}}>
            {footnote}
          </div>
        )}
      </div>
      {bars.map((b, i) => (
        <Sfx key={b.label} name="tick" at={barsAt + i * STAGGER} gain={0.6} />
      ))}
      {highlightIdx >= 0 && <Sfx name="chime" at={barsAt + highlightIdx * STAGGER + GROW - 4} />}
    </Frame>
  );
};
