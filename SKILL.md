---
name: motion-video-audio
description: Create fully scored motion-graphics videos (MP4 with sound) in the calm, editorial style of AI model launch films such as Claude Opus 5 — kinetic serif typography, animated chat/UI demos, benchmark bars, counting stats and logo outros — with AI voice-over narration (edge-tts, incl. Indonesian), an original synthesized music bed that builds to the logo, synced UI sound effects, automatic music ducking and loudness mastering, rendered with Remotion in 16:9 and 9:16. Use this skill whenever the user wants a launch/announcement/promo/teaser/explainer video with audio, narration, voice-over, "pakai suara", "dengan musik", "ada narasinya", sound design, or a Reels/TikTok/Shorts/YouTube video made from text and data — even if they don't say Remotion. Prefer it over the silent motion-video skill whenever sound is wanted or the video is meant for social media.
---

# Motion Video with Audio (launch-film style)

Turns a brief into a finished, mastered MP4: launch-film visuals (warm paper, big serif headlines, one terracotta accent, chat demo typing itself, bars revealing the winner, quiet logo outro) plus a complete soundtrack:

- **Voice-over** — one optional `vo` line per scene, synthesized with edge-tts. Scenes size themselves to the narration.
- **Music** — an original ambient score synthesized to the exact timeline (pad, sub, piano arpeggios, soft pulse, riser, and a resolving hit on the logo frame). Royalty-free because it's generated from code. Or use the user's own track.
- **SFX** — whooshes on cuts, ticks on words/bars, typing while the reply types, a chime on the winning bar, counter ticks, impact + shimmer on the logo. Placed inside the scene components, so they stay in sync automatically.
- **Mix** — music ducks under narration; final files are normalized to −14 LUFS / −1.5 dBTP (social/YouTube target).

All content lives in one file, `src/storyboard.ts`.

## Workflow

1. **Understand the brief.** Get: brand/product name, the one message to remember, 2–5 supporting points, real numbers (if any), target length, platform, **narration language and voice gender**. If the user gave enough, don't interrogate; state your assumptions. Never present invented benchmark numbers as real — use visibly labelled placeholders (`footnote`) or skip the benchmark.

2. **Scaffold.**
   ```bash
   bash <skill-dir>/scripts/new_project.sh <target-dir>
   ```
   Needs Node 18+, ffmpeg, and `edge-tts` on PATH (`pipx install edge-tts`) with internet for narration. Check with `which edge-tts ffmpeg` first; if edge-tts is missing and can't be installed, build without `vo` and tell the user.

3. **Write the storyboard.** Read `references/style-guide.md` (visual pacing, copywriting, recipes) and `references/audio.md` (narration writing, voices, music/SFX/mix settings). Scene types (fields in `src/types.ts`):

   | type | use for |
   |---|---|
   | `headline` | kinetic type: opener, section titles, closing line. `*word*` = accent italic |
   | `chat` | UI demo: prompt → thinking dots → typed reply (with typing sound) |
   | `benchmark` | horizontal bars, one `highlight: true` bar (chime when it lands) |
   | `bigNumber` | a big stat counting up (counter ticks + impact) |
   | `features` | 2–4 numbered capability cards (pop per card) |
   | `logo` | outro: drawn mark or `logoSrc`, name, tagline, CTA (music hit lands here) |

   Each scene: optional `vo`, optional `durationInFrames` (30 fps; omit it on narrated scenes to auto-fit), optional `tone: 'light' | 'dark'`. Leave the `logo` scene without `vo` — let the music hit breathe.

4. **Build audio** — this also fixes the final timeline:
   ```bash
   cd <target-dir> && npm run audio
   ```
   Read the printed timeline: per-scene start, length, narration length, and "(stretched to fit vo)" warnings. If a scene got stretched a lot, shorten its `vo` instead — long narration makes slow, sleepy scenes.

5. **Visual QA** (stills are fast, renders aren't):
   ```bash
   npx tsc --noEmit
   bash <skill-dir>/scripts/contact_sheet.sh <target-dir> Main-16x9 /path/sheet-wide.png
   bash <skill-dir>/scripts/contact_sheet.sh <target-dir> Main-9x16 /path/sheet-tall.png
   ```
   Read the PNGs; fix overflow, crowding, more than one accent per scene.

6. **Audio QA** without ears — after rendering, check loudness and look at the mix:
   ```bash
   ffmpeg -i out/video-16x9.mp4 -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:"
   ffmpeg -y -i out/video-16x9.mp4 -filter_complex "showwavespic=s=1800x300" -frames:v 1 /path/wave.png
   ```
   Expect I ≈ −14 LUFS, peak ≤ −1 dBFS, narration bursts clearly standing above the music bed, and the biggest swell at the logo.

7. **Render** (runs `audio` → both formats → mastering):
   ```bash
   npm run render     # → out/video-16x9.mp4, out/video-9x16.mp4
   ```
   ~30 s video ≈ 1–2 min. Report paths, duration, voice used, and mention `npm run studio` for live preview with sound.

## Customizing

- Brand colors/fonts: `src/theme.ts` tokens only.
- Logo: file in `public/`, `logoSrc: 'logo.svg'`.
- Own music: file in `public/`, `audio.music: 'track.mp3'` (only tracks the user has rights to). Own recorded narration: see `references/audio.md`.
- New scene types / formats / codecs: `references/extending.md`.

## Brand and honesty guardrails

Emulate the *style*, not the brand: don't reproduce Anthropic's (or anyone's) logo or present the video as an official release of a company the user doesn't represent. Synthetic voices must not imitate a real, identifiable person. Benchmarks: real user data or visibly marked illustrative.
