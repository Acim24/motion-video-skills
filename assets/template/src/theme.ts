import {loadFont as loadSerif} from '@remotion/google-fonts/Newsreader';
import {loadFont as loadSans} from '@remotion/google-fonts/Inter';
import {loadFont as loadMono} from '@remotion/google-fonts/JetBrainsMono';

const serif = loadSerif('normal', {weights: ['400', '500'], subsets: ['latin']});
const serifItalic = loadSerif('italic', {weights: ['400'], subsets: ['latin']});
const sans = loadSans('normal', {weights: ['400', '500', '600'], subsets: ['latin']});
const mono = loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});
void serifItalic;

// Warm editorial palette: ivory paper, near-black ink, one terracotta accent.
// Change these tokens (not individual scenes) to re-brand a whole video.
export const palette = {
  light: {
    bg: '#F0EEE6',
    surface: '#FAF9F5',
    ink: '#141413',
    muted: '#6B6A65',
    line: '#D9D6CC',
    accent: '#D97757',
    accentSoft: '#F2D8CB',
    barRest: '#C9C5B9',
  },
  dark: {
    bg: '#141413',
    surface: '#1F1E1C',
    ink: '#F0EEE6',
    muted: '#9C9A92',
    line: '#33322F',
    accent: '#E08A6C',
    accentSoft: '#4A2E24',
    barRest: '#4A4843',
  },
};

export type Tone = keyof typeof palette;
export type Colors = (typeof palette)['light'];

export const fonts = {
  serif: serif.fontFamily,
  sans: sans.fontFamily,
  mono: mono.fontFamily,
};
