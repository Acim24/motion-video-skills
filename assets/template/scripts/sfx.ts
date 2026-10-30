// UI sound effects, synthesized. Kept soft and short: they should be felt, not noticed.
import {SR, Stereo, stereo, rng, lowpass, highpass, reverb, mixIn, mixStereo, finish, midiToHz} from './synth';

const mono = (seconds: number) => new Float32Array(Math.round(seconds * SR));

const whoosh = (): Stereo => {
  const dur = 0.75;
  const r = rng(11);
  const n = mono(dur);
  for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
  lowpass(n, (i) => {
    const t = i / n.length;
    return 250 + 3800 * Math.sin(Math.PI * Math.pow(t, 0.8));
  });
  for (let i = 0; i < n.length; i++) {
    const t = i / n.length;
    n[i] *= Math.pow(Math.sin(Math.PI * t), 2);
  }
  const out = stereo(dur + 0.5);
  // Pan sweeps left → right across the cut.
  for (let i = 0; i < n.length; i++) {
    const pan = -0.5 + i / n.length;
    out.l[i] += n[i] * Math.cos(((pan + 1) * Math.PI) / 4);
    out.r[i] += n[i] * Math.sin(((pan + 1) * Math.PI) / 4);
  }
  mixStereo(out, reverb(n, {room: 0.7}), 0, 0.6);
  return out;
};

const tick = (): Stereo => {
  const n = mono(0.09);
  const r = rng(3);
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    n[i] = (Math.sin(2 * Math.PI * 2400 * t) * 0.7 + (r() * 2 - 1) * 0.3) * Math.exp(-t * 70);
  }
  highpass(n, 600);
  const out = stereo(0.3);
  mixIn(out, n, 0);
  mixStereo(out, reverb(n), 0, 0.25);
  return out;
};

const pop = (): Stereo => {
  const n = mono(0.18);
  let phase = 0;
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    const f = 520 + 480 * Math.exp(-t * 40);
    phase += (2 * Math.PI * f) / SR;
    n[i] = Math.sin(phase) * Math.exp(-t * 28) * Math.min(1, t * 2000);
  }
  const out = stereo(0.45);
  mixIn(out, n, 0);
  mixStereo(out, reverb(n), 0, 0.35);
  return out;
};

// Loopable keyboard clatter (soft laptop keys).
const typing = (): Stereo => {
  const dur = 1.2;
  const r = rng(7);
  const out = stereo(dur);
  let t = 0.01;
  while (t < dur - 0.03) {
    const k = mono(0.025);
    const tone = 1800 + r() * 1600;
    for (let i = 0; i < k.length; i++) {
      const tt = i / SR;
      k[i] = ((r() * 2 - 1) * 0.6 + Math.sin(2 * Math.PI * tone * tt) * 0.4) * Math.exp(-tt * 260);
    }
    highpass(k, 900);
    mixIn(out, k, t, 0.5 + r() * 0.5, r() * 0.6 - 0.3);
    t += 0.055 + r() * 0.07;
  }
  return out;
};

// Loopable soft counter ticks for numbers counting up.
const count = (): Stereo => {
  const dur = 0.4;
  const out = stereo(dur);
  for (let k = 0; k < 8; k++) {
    const n = mono(0.02);
    for (let i = 0; i < n.length; i++) {
      const t = i / SR;
      n[i] = Math.sin(2 * Math.PI * 3200 * t) * Math.exp(-t * 400);
    }
    mixIn(out, n, k * 0.05, 0.6, k % 2 ? 0.2 : -0.2);
  }
  return out;
};

const bell = (midi: number, dur: number, seed = 1) => {
  const f = midiToHz(midi);
  const partials = [
    [1, 1, 3],
    [2.0, 0.5, 4],
    [2.76, 0.35, 5],
    [5.4, 0.18, 8],
    [8.93, 0.08, 12],
  ];
  const r = rng(seed);
  const n = mono(dur);
  for (const [ratio, amp, decay] of partials) {
    const ph = r() * Math.PI * 2;
    for (let i = 0; i < n.length; i++) {
      const t = i / SR;
      n[i] += Math.sin(2 * Math.PI * f * ratio * t + ph) * amp * Math.exp(-t * decay) * Math.min(1, t * 800);
    }
  }
  return n;
};

const chime = (): Stereo => {
  const out = stereo(2.4);
  mixIn(out, bell(84, 1.6), 0, 0.6, -0.15);
  mixIn(out, bell(91, 1.4, 2), 0.06, 0.4, 0.15);
  mixStereo(out, reverb(bell(84, 1.6)), 0, 0.5);
  return out;
};

const impact = (): Stereo => {
  const dur = 2.8;
  const n = mono(dur);
  const r = rng(5);
  let phase = 0;
  for (let i = 0; i < n.length; i++) {
    const t = i / SR;
    const f = 42 + 60 * Math.exp(-t * 9);
    phase += (2 * Math.PI * f) / SR;
    n[i] = Math.sin(phase) * Math.exp(-t * 2.2) * Math.min(1, t * 400);
  }
  const noise = mono(0.4);
  for (let i = 0; i < noise.length; i++) noise[i] = (r() * 2 - 1) * Math.exp((-i / SR) * 14);
  lowpass(noise, 900);
  const out = stereo(dur + 1);
  mixIn(out, n, 0, 1);
  mixIn(out, noise, 0, 0.5);
  mixStereo(out, reverb(noise, {room: 0.9}), 0, 1.2);
  return out;
};

const shimmer = (): Stereo => {
  const dur = 2.6;
  const out = stereo(dur + 1);
  const notes = [86, 90, 93, 98];
  notes.forEach((m, k) => {
    const n = mono(dur);
    const f = midiToHz(m);
    for (let i = 0; i < n.length; i++) {
      const t = i / SR;
      const env = Math.min(1, t / 0.25) * Math.exp(-t * 1.6);
      n[i] = Math.sin(2 * Math.PI * f * t) * env * (0.75 + 0.25 * Math.sin(2 * Math.PI * (5 + k) * t));
    }
    mixIn(out, n, k * 0.05, 0.3, k % 2 ? 0.5 : -0.5);
    mixStereo(out, reverb(n, {room: 0.9}), k * 0.05, 0.25);
  });
  return out;
};

// Rising noise + tone, ends at its own length: place it so it ends on the hit.
const swell = (): Stereo => {
  const dur = 2;
  const r = rng(9);
  const n = mono(dur);
  for (let i = 0; i < n.length; i++) n[i] = r() * 2 - 1;
  lowpass(n, (i) => 200 + 5000 * Math.pow(i / n.length, 2));
  for (let i = 0; i < n.length; i++) n[i] *= Math.pow(i / n.length, 2.5);
  const out = stereo(dur);
  mixIn(out, n, 0, 0.8);
  mixStereo(out, reverb(n), 0, 0.5);
  return out;
};

export const SFX: Record<string, () => Stereo> = {
  whoosh,
  tick,
  pop,
  type: typing,
  count,
  chime,
  impact,
  shimmer,
  swell,
};

export const renderSfx = (name: string) => finish(SFX[name](), name === 'type' || name === 'count' ? 0.5 : 0.8);
