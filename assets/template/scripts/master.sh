#!/usr/bin/env bash
# Loudness-normalize finished videos in place (-14 LUFS, -1.5 dBTP: YouTube/Instagram/TikTok target).
# Video stream is copied untouched; only audio is re-encoded.
set -euo pipefail
for f in "$@"; do
  [ -f "$f" ] || continue
  tmp="${f%.mp4}.master.mp4"
  ffmpeg -y -loglevel error -i "$f" -c:v copy -af loudnorm=I=-14:TP=-1.5:LRA=11 -ar 48000 -c:a aac -b:a 192k -movflags +faststart "$tmp"
  mv "$tmp" "$f"
  echo "mastered: $f"
done
