import React from 'react';
import {Audio, Sequence, staticFile, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {Storyboard, TimedScene} from './types';
import {AudioManifest, VO_LEAD} from './timeline';
import {Headline} from './scenes/Headline';
import {Chat} from './scenes/Chat';
import {Benchmark} from './scenes/Benchmark';
import {BigNumber} from './scenes/BigNumber';
import {Features} from './scenes/Features';
import {Logo} from './scenes/Logo';
import {Sfx, SfxContext} from './audio/Sfx';
import {duckGain} from './audio/duck';

const renderScene = (scene: TimedScene) => {
  switch (scene.type) {
    case 'headline':
      return <Headline {...scene} />;
    case 'chat':
      return <Chat {...scene} />;
    case 'benchmark':
      return <Benchmark {...scene} />;
    case 'bigNumber':
      return <BigNumber {...scene} />;
    case 'features':
      return <Features {...scene} />;
    case 'logo':
      return <Logo {...scene} />;
  }
};

export type VideoProps = {storyboard: Storyboard; timeline: TimedScene[]; manifest: AudioManifest};

export const Video: React.FC<VideoProps> = ({storyboard, timeline, manifest}) => {
  const {durationInFrames, fps} = useVideoConfig();
  const {audio} = storyboard;

  // Absolute frame ranges where narration plays, used to duck the music under it.
  const voIntervals: [number, number][] = timeline
    .filter((s) => manifest.vo[s.index])
    .map((s) => {
      const start = s.from + VO_LEAD;
      return [start, start + Math.ceil(manifest.vo[s.index].seconds * fps)];
    });

  return (
    <SfxContext.Provider value={{enabled: audio.sfx, volume: audio.sfxVolume}}>
      <TransitionSeries>
        {timeline.map((scene, i) => (
          <React.Fragment key={i}>
            {i > 0 && <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: storyboard.transitionFrames})} />}
            <TransitionSeries.Sequence durationInFrames={scene.durationInFrames}>
              {renderScene(scene)}
              {/* Soft whoosh under every cut, timed to the middle of the cross-fade. */}
              {i > 0 && <Sfx name="whoosh" at={0} gain={0.5} />}
              {manifest.vo[i] && (
                <Sequence from={VO_LEAD} layout="none">
                  <Audio src={staticFile(manifest.vo[i].file)} volume={audio.voiceVolume} />
                </Sequence>
              )}
            </TransitionSeries.Sequence>
          </React.Fragment>
        ))}
      </TransitionSeries>
      {manifest.music && (
        <Audio
          src={staticFile(manifest.music)}
          volume={(f) => audio.musicVolume * duckGain(f, voIntervals, audio.duckTo) * Math.min(1, (durationInFrames - f) / 20)}
        />
      )}
    </SfxContext.Provider>
  );
};
