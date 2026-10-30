import React from 'react';
import {fonts} from '../theme';

// Splits "Meet *Nova* today" into word tokens, flagging accent words.
export const tokenize = (text: string) => {
  const out: {word: string; accent: boolean}[] = [];
  text.split(/(\*[^*]+\*)/g).forEach((chunk) => {
    if (!chunk) return;
    const accent = chunk.startsWith('*') && chunk.endsWith('*');
    const clean = accent ? chunk.slice(1, -1) : chunk;
    clean
      .split(/\s+/)
      .filter(Boolean)
      .forEach((word) => out.push({word, accent}));
  });
  return out;
};

export const accentStyle = (color: string): React.CSSProperties => ({
  fontFamily: fonts.serif,
  fontStyle: 'italic',
  color,
});
