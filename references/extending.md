# Extending the template

## Project map

```
src/
  storyboard.ts   ← the content (scenes, vo lines, audio settings)
  types.ts        ← scene type definitions (add new scene types here)
  timeline.ts     ← resolves scene lengths (fits narration) and start frames; shared with the audio build
  theme.ts        ← palette (light/dark) + fonts
  Video.tsx       ← maps scene.type → component, fades, cut whooshes, narration, ducked music
  Root.tsx        ← registers Main-16x9 and Main-9x16 compositions
  audio/Sfx.tsx   ← <Sfx name at length gain> one-shot/looping sound effect
  audio/duck.ts   ← music gain under narration
  generated/audio-manifest.json ← written by `npm run audio` (music file + vo files/lengths)
scripts/
  build-audio.ts  ← npm run audio: sfx → vo → timeline → music → manifest
  synth.ts, sfx.ts, music.ts ← dependency-free synthesis
  master.sh       ← loudness normalization of finished MP4s
  lib/anim.ts     ← easing, progress(), reveal(), exitOpacity(), useLayout()
  lib/Frame.tsx   ← shared background + Eyebrow label
  lib/RichText.tsx← *accent* tokenizer
  scenes/*.tsx    ← one component per scene type
```

## Adding a scene type

1. Add a `XxxScene = Base & {type: 'xxx'; ...}` to `types.ts` and to the `Scene` union.
2. Create `scenes/Xxx.tsx`, typed `React.FC<Timed<XxxScene>>`. Start from the closest existing scene. Wrap in `<Frame tone={tone}>`, take sizes from `useLayout()` (`s` = scale relative to 1080 short edge, `vertical` flag), animate with `reveal()` / `progress()` from `lib/anim.ts`, and multiply the root opacity by `exitOpacity(frame, durationInFrames)`.
3. Add `<Sfx name="..." at={frame} />` for the moments that deserve sound (entries, landings), and a default length in `DEFAULT_LENGTH` in `timeline.ts`.
4. Add a `case 'xxx'` in `Video.tsx`'s `renderScene`. TypeScript's exhaustiveness will flag a missing case.
5. `npx tsc --noEmit`, then a contact sheet.

Useful scene ideas: `quote` (testimonial with avatar), `code` (syntax-highlighted code typing, mono font), `terminal` (commands + streaming output), `compare` (two columns before/after), `timeline` (steps along a line), `screenshot` (an `<Img>` from `public/` sliding in inside a window frame).

## Remotion rules that bite

- **All animation must be a pure function of `useCurrentFrame()`.** CSS transitions/animations, `setTimeout`, `Date.now()` and `Math.random()` break rendering (frames render in parallel, out of order). Use `random('seed')` from `remotion` for randomness.
- Assets in `public/` are referenced with `staticFile('name.ext')`; use `<Img>`, `<Video>` (`OffthreadVideo` for heavy clips), `<Audio>` from `remotion` so they're awaited before a frame is captured.
- Fonts load through `@remotion/google-fonts/<Family>` in `theme.ts`. Loading only needed weights/subsets keeps renders fast. For a local font file use `@remotion/fonts` `loadFont({family, url: staticFile('x.woff2')})`.
- A `<Sequence>` without `layout="none"` is an AbsoluteFill and can cover the scene — keep `layout="none"` on audio-only sequences.
- Inside a `TransitionSeries.Sequence`, `useCurrentFrame()` starts at 0 for that scene and `useVideoConfig().durationInFrames` is the *scene's* length.
- `spring()` with `damping: 200` gives a smooth no-overshoot settle — keep that; lower damping bounces, which is off-style.

## Other formats and outputs

Add entries to `formats` in `Root.tsx` (e.g. `{id: 'Main-1x1', width: 1080, height: 1080}`, `{id: 'Main-4k', width: 3840, height: 2160}`) — layout scales automatically.

```bash
npx remotion render src/index.ts Main-16x9 out/v.mp4 --crf=16           # higher quality
npx remotion render src/index.ts Main-16x9 out/v.gif --codec=gif --every-nth-frame=2
npx remotion render src/index.ts Main-16x9 out/v.mov --codec=prores --prores-profile=4444  # editing / alpha
npx remotion render src/index.ts Main-16x9 out/v.webm --codec=vp9
npx remotion render src/index.ts Main-16x9 out/part.mp4 --frames=0-120  # quick partial
npx remotion still  src/index.ts Main-16x9 out/thumb.png --frame=60     # thumbnail
```

For a transparent overlay, give `Frame` a transparent background for that composition and render ProRes 4444 or VP9 with `--pixel-format=yuva420p`.

## Troubleshooting

- *Chrome download fails / offline*: add `Config.setBrowserExecutable('/usr/bin/google-chrome')` (or the system Chrome/Chromium path) to `remotion.config.ts`.
- *Fonts look like Times/Arial*: font fetch failed (network). Retry, or switch to local font files.
- *Render slow*: `--concurrency=50%` or higher; JPEG frames are already the default.
