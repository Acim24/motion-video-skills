# Style guide: the launch-film look

The reference aesthetic is the calm, confident launch film of a frontier AI model (e.g. Claude Opus 5). What makes it work is restraint. When in doubt, remove.

## Principles

1. **One idea per scene.** A viewer gets ~3 seconds per scene. If a scene needs two sentences to explain, split it into two scenes.
2. **Typography carries the film.** Big serif headlines, generous whitespace, nothing decorative. No icons-for-the-sake-of-icons, no gradients, no 3D, no particles.
3. **One accent, used sparingly.** Terracotta marks the *single* most important thing on screen: the product name in the headline, the winning bar, the stat's unit. If two things are accented, neither is.
4. **Calm motion.** Long ease-out (already in `lib/anim.ts`), small distances, slight blur on entry. No bounces, spins, whip-pans or shakes. Motion should feel like the page is settling, not performing.
5. **Rhythm: light → dark → light.** Mostly light scenes; drop to `tone: 'dark'` for one emotional beat near the end (closing line + logo) so the ending lands.
6. **Show, then tell.** A chat demo or benchmark is more convincing than an adjective. Put proof (demo/number) right after a claim.

## Copywriting

- Headlines: 2–6 words per line, max 2 lines. Sentence case. No exclamation marks.
- Accent the noun that matters: `Meet *Nova 2*`, `Do your *best work*`.
- `sub` text: one sentence, under ~90 characters.
- Chat prompt: something a real user would type (short, specific). Reply: 1–3 short sentences, concrete, ending in a result. Keep under ~220 characters for 16:9 and ~160 for 9:16 readability — the reply types out, so long replies need long scenes.
- Benchmark title states the takeaway ("State of the art on real engineering tasks"), not the benchmark name. Put the benchmark name in `eyebrow`. Max 5 bars.
- Feature cards: title 1–3 words, body under ~50 characters.
- Write in the user's language. The template fonts cover Latin scripts (incl. Indonesian); for CJK/Arabic etc. change fonts in `theme.ts`.

## Timing (30 fps)

Narrated scenes without `durationInFrames` size themselves to the narration (+10 frames lead, +20 tail). The table below is for silent scenes or minimum lengths.

| scene | comfortable length |
|---|---|
| headline, 1 line | 75–105 frames |
| headline, 2 lines + sub | 105–135 |
| chat | 150 + ~0.5 frame per reply character (cap ~300) |
| benchmark | 120–165 (more bars → longer) |
| bigNumber | 75–105 |
| features (3 items) | 120–150 |
| logo outro | 90–120 |

`transitionFrames` (default 12) is subtracted between scenes. Total ≈ sum − 12 × (scenes − 1).

## Recipes

**15 s vertical teaser** (Reels/Shorts): headline (opener, 90) → bigNumber (90) → headline dark (closing line, 90) → logo (105) ≈ 13.6 s. Skip chat — too slow for 15 s.

**30 s launch film** (default template): headline opener → chat demo → benchmark → bigNumber → features → dark closing headline → logo.

**60 s announcement**: opener → headline ("The problem") → chat demo 1 → headline (transition claim) → chat demo 2 → benchmark 1 → benchmark 2 → bigNumber → features → testimonial as headline with quote in `lines` and name in `sub` → dark closing headline → logo.

**Feature release (not a model)**: eyebrow "New in <Product>" → headline with feature name accented → chat or features showing it → bigNumber with impact metric → logo with CTA URL.

## 16:9 vs 9:16

Every scene adapts automatically (`useLayout()`): vertical stacks labels above bars, single-column features, left-aligned headlines, taller chat card. Still check both contact sheets — long single words and long bar labels are the usual 9:16 casualties. Shorten copy rather than shrinking type.
