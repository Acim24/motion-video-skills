// npm run audio — builds every audio asset the video needs, then writes src/generated/audio-manifest.json:
//   1. sound effects      → public/sfx/*.wav
//   2. voice-over (vo)    → public/vo/<hash>.wav   (edge-tts, silence-trimmed, cached by text+voice)
//   3. timeline           → scenes stretched to fit their narration
//   4. music              → public/generated/music.wav (synthesized to the final timeline)
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {existsSync, mkdirSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {storyboard} from '../src/storyboard';
import {resolveTimeline, totalFrames, AudioManifest} from '../src/timeline';
import {SFX, renderSfx} from './sfx';
import {renderMusic} from './music';
import {writeWav} from './synth';

const ROOT = resolve(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const EDGE_TTS = process.env.EDGE_TTS ?? 'edge-tts';
const {audio, fps} = storyboard;

const run = (cmd: string, args: string[]) => execFileSync(cmd, args, {stdio: ['ignore', 'pipe', 'pipe']}).toString().trim();
const ensureDir = (d: string) => mkdirSync(d, {recursive: true});

// 1. SFX
ensureDir(join(PUBLIC, 'sfx'));
for (const name of Object.keys(SFX)) writeWav(join(PUBLIC, 'sfx', `${name}.wav`), renderSfx(name));
console.log(`sfx: ${Object.keys(SFX).length} effects`);

// 2. Voice-over
const manifest: AudioManifest = {music: null, vo: {}};
const voDir = join(PUBLIC, 'vo');
ensureDir(voDir);
const keep = new Set<string>();
storyboard.scenes.forEach((scene, i) => {
  if (!scene.vo?.trim()) return;
  const rate = audio.voiceRate ?? '+0%';
  const hash = createHash('sha1').update(`${audio.voice}|${rate}|${scene.vo}`).digest('hex').slice(0, 12);
  const file = `${hash}.wav`;
  const out = join(voDir, file);
  keep.add(file);
  if (!existsSync(out)) {
    const mp3 = join(voDir, `${hash}.mp3`);
    try {
      run(EDGE_TTS, ['--voice', audio.voice, `--rate=${rate}`, '--text', scene.vo, '--write-media', mp3]);
    } catch (e) {
      console.error(
        `\nvoice-over failed for scene ${i} (${audio.voice}). edge-tts needs internet and \`pipx install edge-tts\`.\n` +
          `Fix that, change the voice, or remove \`vo\` from the scene.\n`,
      );
      throw e;
    }
    // Trim leading/trailing silence so scene timing is driven by actual speech.
    run('ffmpeg', [
      '-y', '-loglevel', 'error', '-i', mp3,
      '-af', 'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,highpass=f=70',
      '-ar', '48000', '-ac', '1', out,
    ]);
    rmSync(mp3);
  }
  const seconds = parseFloat(run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', out]));
  manifest.vo[i] = {file: `vo/${file}`, seconds};
});
for (const f of readdirSync(voDir)) if (!keep.has(f) && f !== '.gitkeep') rmSync(join(voDir, f));
console.log(`voice-over: ${Object.keys(manifest.vo).length} lines (${audio.voice})`);

// 3. Timeline (scenes grow to fit narration)
const timeline = resolveTimeline(storyboard, manifest);
const total = totalFrames(storyboard, timeline);

// 4. Music
if (audio.music === 'generated') {
  const logo = [...timeline].reverse().find((s) => s.type === 'logo') ?? timeline[timeline.length - 1];
  const hitAt = logo.from / fps;
  const beforeLogo = timeline[logo.index - 1];
  const climaxAt = beforeLogo ? beforeLogo.from / fps : hitAt * 0.75;
  ensureDir(join(PUBLIC, 'generated'));
  writeWav(
    join(PUBLIC, 'generated', 'music.wav'),
    renderMusic({seconds: total / fps, key: audio.key ?? 'D', sceneStarts: timeline.map((s) => s.from / fps), climaxAt, hitAt}),
  );
  manifest.music = 'generated/music.wav';
} else if (audio.music !== 'none') {
  if (!existsSync(join(PUBLIC, audio.music))) throw new Error(`music file public/${audio.music} not found`);
  manifest.music = audio.music;
}
console.log(`music: ${manifest.music ?? 'none'}`);

writeFileSync(join(ROOT, 'src', 'generated', 'audio-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

// Summary so timing problems are visible before rendering.
console.log(`\ntimeline (${(total / fps).toFixed(1)} s @ ${fps} fps)`);
for (const s of timeline) {
  const vo = manifest.vo[s.index];
  const asked = storyboard.scenes[s.index].durationInFrames;
  const stretched = asked !== undefined && s.durationInFrames > asked;
  console.log(
    `  ${String(s.index).padStart(2)} ${s.type.padEnd(10)} ${(s.from / fps).toFixed(2).padStart(6)}s  ${(s.durationInFrames / fps).toFixed(2)}s` +
      (vo ? `  vo ${vo.seconds.toFixed(2)}s` : '') +
      (stretched ? '  (stretched to fit vo)' : ''),
  );
}
