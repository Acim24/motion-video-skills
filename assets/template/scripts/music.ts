// Original ambient score shaped to the video's timeline:
// soft pad + sub + sparse piano-like arpeggios, a heartbeat pulse in the body,
// a riser into the logo, and a resolving tonic chord + bell exactly on the logo frame.
import {SR, Stereo, stereo, rng, midiToHz, lowpass, reverb, mixIn, mixStereo, finish} from './synth';

export type MusicPlan = {
  seconds: number;
  key: string;
  /** Seconds where each scene starts. */
  sceneStarts: number[];
  /** Seconds where the build-up towards the ending begins. */
  climaxAt: number;
  /** Seconds of the final hit (logo). */
  hitAt: number;
};

const KEYS: Record<string, number> = {C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11};

// I maj9 → vi9 → IV maj9 → V sus (relative semitones, close voicings around middle C).
const PROGRESSION = [
  [0, 4, 7, 11, 14],
  [-3, 0, 4, 7, 11],
  [-7, -3, 0, 4, 7],
  [-5, 0, 2, 5, 9],
];
const TONIC = PROGRESSION[0];

const BPM = 84;
const BEAT = 60 / BPM;
const CHORD_LEN = BEAT * 8;

const pianoNote = (midi: number, dur: number, vel: number) => {
  const f = midiToHz(midi);
  const n = new Float32Array(Math.round(dur * SR));
  const harmonics = [1, 0.45, 0.22, 0.12, 0.05];
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    let v = 0;
    for (let h = 0; h < harmonics.length; h++) v += Math.sin(2 * Math.PI * f * (h + 1) * t) * harmonics[h] * Math.exp(-t * (1.6 + h * 1.4));
    n[i] = v * vel * Math.min(1, t * 600);
  }
  return n;
};

const padVoice = (midi: number, dur: number, attack: number, release: number, seed: number) => {
  const f = midiToHz(midi);
  const r = rng(seed);
  const n = new Float32Array(Math.round(dur * SR));
  const detune = [0.997, 1, 1.003];
  const phases = detune.map(() => r() * Math.PI * 2);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    let v = 0;
    detune.forEach((d, k) => {
      const ph = 2 * Math.PI * f * d * t + phases[k];
      v += Math.sin(ph) + 0.18 * Math.sin(2 * ph) + 0.06 * Math.sin(3 * ph);
    });
    const env = Math.min(1, t / attack) * Math.min(1, Math.max(0, (dur - t) / release));
    n[i] = (v / detune.length) * env;
  }
  return lowpass(n, 2200);
};

export const renderMusic = (plan: MusicPlan): Stereo => {
  const root = 48 + (KEYS[plan.key] ?? 2) + 12; // middle register
  const r = rng(42);
  const bus = stereo(plan.seconds);
  const send = new Float32Array(bus.l.length); // mono reverb send

  const sendIn = (src: Float32Array, at: number, gain: number) => {
    const o = Math.round(at * SR);
    for (let i = 0; i < src.length && o + i < send.length; i++) if (o + i >= 0) send[o + i] += src[i] * gain;
  };

  // Chords on a fixed grid until the hit; the hit always lands on the tonic.
  const chords: {at: number; dur: number; notes: number[]}[] = [];
  for (let at = 0, k = 0; at < plan.hitAt - 0.5; at += CHORD_LEN, k++) {
    chords.push({at, dur: Math.min(CHORD_LEN, plan.hitAt - at), notes: PROGRESSION[k % PROGRESSION.length]});
  }
  chords.push({at: plan.hitAt, dur: plan.seconds - plan.hitAt, notes: TONIC});

  chords.forEach((c, ci) => {
    const isHit = ci === chords.length - 1;
    const intro = c.at < 2;
    // Pad
    c.notes.forEach((iv, k) => {
      const v = padVoice(root + iv, c.dur + 1.5, intro ? 2.5 : isHit ? 0.05 : 0.8, 1.5, ci * 10 + k);
      mixIn(bus, v, c.at, isHit ? 0.11 : 0.07, (k / (c.notes.length - 1)) * 1.2 - 0.6);
      sendIn(v, c.at, 0.05);
    });
    // Sub bass on the chord root
    const bass = padVoice(root - 24 + c.notes[0] + (c.notes[0] < -4 ? 12 : 0), c.dur + 1, isHit ? 0.02 : 0.6, 1, ci);
    mixIn(bus, bass, c.at, isHit ? 0.3 : c.at < 3 ? 0.08 : 0.2);
  });

  // Arpeggios: sparse in the intro, flowing in the body, busier in the build.
  const eighth = BEAT / 2;
  for (let t = 1; t < plan.hitAt - eighth; t += eighth) {
    const chord = chords.find((c) => t >= c.at && t < c.at + c.dur) ?? chords[0];
    const inBuild = t >= plan.climaxAt;
    const density = t < 3 ? 0.25 : inBuild ? 0.85 : 0.5;
    if (r() > density) continue;
    const step = Math.round(t / eighth);
    const iv = chord.notes[(step * 3) % chord.notes.length] + 12 * (step % 4 === 3 ? 1 : 0);
    const note = pianoNote(root + 12 + iv, 2.4, 0.5 + r() * 0.3);
    const gain = inBuild ? 0.085 + 0.06 * ((t - plan.climaxAt) / Math.max(0.1, plan.hitAt - plan.climaxAt)) : 0.07;
    mixIn(bus, note, t, gain, r() * 0.8 - 0.4);
    sendIn(note, t, gain * 0.8);
  }

  // Heartbeat pulse (very soft low thump) on beats 1 and 3, body + build, with a breath before the hit.
  const firstBody = plan.sceneStarts[1] ?? 3;
  for (let t = firstBody; t < plan.hitAt - BEAT; t += BEAT * 2) {
    const thump = new Float32Array(Math.round(0.35 * SR));
    let ph = 0;
    for (let i = 0; i < thump.length; i++) {
      const tt = i / SR;
      ph += (2 * Math.PI * (48 + 50 * Math.exp(-tt * 30))) / SR;
      thump[i] = Math.sin(ph) * Math.exp(-tt * 12) * Math.min(1, tt * 500);
    }
    mixIn(bus, thump, t, t >= plan.climaxAt ? 0.22 : 0.14);
  }

  // Riser into the hit
  const riseLen = Math.min(3, plan.hitAt - plan.climaxAt);
  if (riseLen > 0.5) {
    const n = new Float32Array(Math.round(riseLen * SR));
    for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
    lowpass(n, (i) => 300 + 6000 * Math.pow(i / n.length, 2));
    for (let i = 0; i < n.length; i++) n[i] *= Math.pow(i / n.length, 3);
    mixIn(bus, n, plan.hitAt - riseLen, 0.05);
    sendIn(n, plan.hitAt - riseLen, 0.05);
  }

  // The hit: low piano octave + bell-like top note.
  for (const [iv, g] of [
    [-12, 0.16],
    [0, 0.12],
    [7, 0.08],
    [24, 0.08],
  ] as const) {
    const note = pianoNote(root + iv, Math.min(5, plan.seconds - plan.hitAt + 0.1), 0.9);
    mixIn(bus, note, plan.hitAt, g);
    sendIn(note, plan.hitAt, g);
  }

  mixStereo(bus, reverb(send, {room: 0.88, damp: 0.4}), 0, 1.4);

  // Global fade in/out.
  const fadeIn = 1.5 * SR;
  const fadeOut = 1.2 * SR;
  for (let i = 0; i < bus.l.length; i++) {
    const g = Math.min(1, i / fadeIn, (bus.l.length - i) / fadeOut);
    bus.l[i] *= g;
    bus.r[i] *= g;
  }
  return finish(bus, 0.85);
};
