import React from 'react';
import {useCurrentFrame, useVideoConfig, spring, interpolate} from 'remotion';
import {ChatScene, Timed} from '../types';
import {palette, fonts} from '../theme';
import {reveal, exitOpacity, useLayout, progress} from '../lib/anim';
import {Sfx} from '../audio/Sfx';
import {Frame} from '../lib/Frame';

// UI demo: a chat window floats in, the user prompt appears, then the reply types out with a caret.
export const Chat: React.FC<Timed<ChatScene>> = ({title = 'New chat', prompt, response, assistantName = 'Assistant', tone = 'light', durationInFrames}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const {s, vertical} = useLayout();
  const c = palette[tone];

  const enter = spring({frame, fps, config: {damping: 200, mass: 0.8}});
  const promptAt = 14;
  const thinkAt = promptAt + 20;
  const typeStart = thinkAt + 18;
  // Finish typing ~25% before the scene ends so the viewer can read the full reply.
  const typeEnd = Math.max(typeStart + 10, durationInFrames * 0.75);
  const chars = Math.round(interpolate(frame, [typeStart, typeEnd], [0, response.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const typing = frame >= typeStart && chars < response.length;
  const caretOn = typing || Math.floor(frame / 15) % 2 === 0;
  const thinking = frame >= thinkAt && frame < typeStart;

  const cardW = vertical ? '100%' : 1300 * s;
  const body = 34 * s;

  return (
    <Frame tone={tone}>
      <div
        style={{
          opacity: exitOpacity(frame, durationInFrames) * enter,
          transform: `translateY(${(1 - enter) * 60 * s}px) scale(${0.96 + enter * 0.04})`,
          width: cardW,
          margin: '0 auto',
          background: c.surface,
          border: `${1.5 * s}px solid ${c.line}`,
          borderRadius: 28 * s,
          boxShadow: `0 ${30 * s}px ${80 * s}px rgba(20,20,19,${tone === 'light' ? 0.1 : 0.4})`,
          overflow: 'hidden',
        }}
      >
        <div style={{display: 'flex', alignItems: 'center', gap: 12 * s, padding: `${22 * s}px ${30 * s}px`, borderBottom: `${1.5 * s}px solid ${c.line}`}}>
          {[0, 1, 2].map((d) => (
            <div key={d} style={{width: 14 * s, height: 14 * s, borderRadius: 99, background: c.line}} />
          ))}
          <div style={{marginLeft: 16 * s, fontSize: 24 * s, color: c.muted}}>{title}</div>
        </div>
        <div style={{padding: 44 * s, display: 'flex', flexDirection: 'column', gap: 36 * s, minHeight: (vertical ? 1100 : 520) * s}}>
          <div
            style={{
              alignSelf: 'flex-end',
              maxWidth: '80%',
              background: c.accentSoft,
              color: c.ink,
              padding: `${22 * s}px ${30 * s}px`,
              borderRadius: 22 * s,
              fontSize: body,
              lineHeight: 1.4,
              ...reveal(frame, promptAt, {scale: s, blur: 0}),
            }}
          >
            {prompt}
          </div>
          <div style={{opacity: progress(frame, thinkAt, 10)}}>
            <div style={{fontFamily: fonts.mono, fontSize: 22 * s, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.accent, marginBottom: 16 * s}}>
              {assistantName}
            </div>
            {thinking ? (
              <div style={{display: 'flex', gap: 10 * s}}>
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    style={{
                      width: 12 * s,
                      height: 12 * s,
                      borderRadius: 99,
                      background: c.muted,
                      opacity: 0.3 + 0.7 * Math.abs(Math.sin((frame - d * 4) / 6)),
                    }}
                  />
                ))}
              </div>
            ) : (
              <div style={{fontFamily: fonts.serif, fontSize: body * 1.12, lineHeight: 1.45, whiteSpace: 'pre-wrap'}}>
                {response.slice(0, chars)}
                <span
                  style={{
                    display: 'inline-block',
                    width: 3 * s,
                    height: body * 1.1,
                    marginLeft: 4 * s,
                    verticalAlign: 'text-bottom',
                    background: c.accent,
                    opacity: caretOn ? 1 : 0,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Sfx name="pop" at={promptAt} />
      <Sfx name="tick" at={thinkAt} gain={0.4} />
      <Sfx name="type" at={typeStart} length={Math.round(typeEnd - typeStart)} gain={0.5} />
    </Frame>
  );
};
