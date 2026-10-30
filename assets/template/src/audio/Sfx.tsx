import React, {createContext, useContext} from 'react';
import {Audio, Sequence, staticFile} from 'remotion';

export type SfxName = 'whoosh' | 'tick' | 'pop' | 'type' | 'count' | 'chime' | 'impact' | 'shimmer' | 'swell';

export const SfxContext = createContext<{enabled: boolean; volume: number}>({enabled: true, volume: 0.6});

// A one-shot sound effect that starts at `at` frames into the current scene.
// Scenes place these next to the animation they belong to, so sound stays in sync when timing changes.
export const Sfx: React.FC<{name: SfxName; at: number; gain?: number; length?: number}> = ({name, at, gain = 1, length}) => {
  const {enabled, volume} = useContext(SfxContext);
  if (!enabled) return null;
  return (
    <Sequence from={Math.max(0, Math.round(at))} durationInFrames={length} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume * gain} loop={length !== undefined} />
    </Sequence>
  );
};
