// Tiny dependency-free synthesis toolkit: deterministic noise, filters, reverb, WAV output.
// Everything is generated from code, so the audio is original and royalty-free.
import {writeFileSync} from 'node:fs';

export const SR = 48000;

export type Stereo = {l: Float32Array; r: Float32Array};

export const stereo = (seconds: number): Stereo => {
  const n = Math.max(1, Math.round(seconds * SR));
  return {l: new Float32Array(n), r: new Float32Array(n)};
};

export const rng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// One-pole low-pass with a per-sample cutoff (Hz), in place.
export const lowpass = (buf: Float32Array, cutoff: number | ((i: number) => number)) => {
  let y = 0;
  for (let i = 0; i < buf.length; i++) {
    const fc = typeof cutoff === 'number' ? cutoff : cutoff(i);
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    y += a * (buf[i] - y);
    buf[i] = y;
  }
  return buf;
};

export const highpass = (buf: Float32Array, cutoff: number) => {
  const lp = lowpass(Float32Array.from(buf), cutoff);
  for (let i = 0; i < buf.length; i++) buf[i] -= lp[i];
  return buf;
};

// Small Schroeder/Freeverb-style reverb; returns the wet signal only.
export const reverb = (input: Float32Array, opts: {room?: number; damp?: number; spread?: number} = {}): Stereo => {
  const {room = 0.84, damp = 0.3, spread = 23} = opts;
  const combs = [1557, 1617, 1491, 1422, 1277, 1356];
  const allpasses = [556, 441, 341];
  const run = (offset: number) => {
    const out = new Float32Array(input.length);
    for (const len of combs) {
      const d = new Float32Array(len + offset);
      let idx = 0;
      let store = 0;
      for (let i = 0; i < input.length; i++) {
        const y = d[idx];
        store = y * (1 - damp) + store * damp;
        d[idx] = input[i] * 0.015 + store * room;
        out[i] += y;
        idx = (idx + 1) % d.length;
      }
    }
    for (const len of allpasses) {
      const d = new Float32Array(len + offset);
      let idx = 0;
      for (let i = 0; i < out.length; i++) {
        const b = d[idx];
        const x = out[i];
        d[idx] = x + b * 0.5;
        out[i] = b - x;
        idx = (idx + 1) % d.length;
      }
    }
    return out;
  };
  return {l: run(0), r: run(spread)};
};

// Mix a mono source into a stereo bus at `start` seconds with gain and pan (-1..1).
export const mixIn = (bus: Stereo, src: Float32Array, start: number, gain = 1, pan = 0) => {
  const o = Math.round(start * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < src.length; i++) {
    const j = o + i;
    if (j < 0 || j >= bus.l.length) continue;
    bus.l[j] += src[i] * gl;
    bus.r[j] += src[i] * gr;
  }
};

export const mixStereo = (bus: Stereo, src: Stereo, start = 0, gain = 1) => {
  const o = Math.round(start * SR);
  for (let i = 0; i < src.l.length; i++) {
    const j = o + i;
    if (j < 0 || j >= bus.l.length) continue;
    bus.l[j] += src.l[i] * gain;
    bus.r[j] += src.r[i] * gain;
  }
};

// Peak-normalize to `peak` and apply a gentle tanh soft clip so nothing ever hard-clips.
export const finish = (s: Stereo, peak = 0.89): Stereo => {
  let m = 1e-9;
  for (let i = 0; i < s.l.length; i++) m = Math.max(m, Math.abs(s.l[i]), Math.abs(s.r[i]));
  const g = peak / m;
  for (let i = 0; i < s.l.length; i++) {
    s.l[i] = Math.tanh(s.l[i] * g * 1.1) / Math.tanh(1.1);
    s.r[i] = Math.tanh(s.r[i] * g * 1.1) / Math.tanh(1.1);
  }
  return s;
};

export const writeWav = (path: string, s: Stereo) => {
  const n = s.l.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write('WAVEfmt ', 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(n * 4, 40);
  const clamp = (v: number) => Math.max(-1, Math.min(1, v));
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(clamp(s.l[i]) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(clamp(s.r[i]) * 32767), 46 + i * 4);
  }
  writeFileSync(path, buf);
};
