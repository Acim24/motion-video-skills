import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {storyboard} from './storyboard';
import {resolveTimeline, totalFrames, AudioManifest} from './timeline';
import manifestJson from './generated/audio-manifest.json';

const formats = [
  {id: 'Main-16x9', width: 1920, height: 1080},
  {id: 'Main-9x16', width: 1080, height: 1920},
];

// Written by `npm run audio`; until then the video is silent apart from SFX.
const manifest = manifestJson as AudioManifest;
const timeline = resolveTimeline(storyboard, manifest);

export const Root: React.FC = () => (
  <>
    {formats.map((f) => (
      <Composition
        key={f.id}
        id={f.id}
        component={Video}
        width={f.width}
        height={f.height}
        fps={storyboard.fps}
        durationInFrames={totalFrames(storyboard, timeline)}
        defaultProps={{storyboard, timeline, manifest}}
      />
    ))}
  </>
);
