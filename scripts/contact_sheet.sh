#!/usr/bin/env bash
# Usage: contact_sheet.sh <project-dir> <composition-id> <out.png> [frame ...]
# Renders the given frames (default: 9 evenly spaced frames) and tiles them into one PNG
# so you can visually QA a video without watching it.
set -euo pipefail
PROJ="${1:?project dir}"; COMP="${2:?composition id}"; OUT="${3:?output png}"; shift 3
cd "$PROJ"
TMP="$(mktemp -d)"
FRAMES=("$@")
if [ ${#FRAMES[@]} -eq 0 ]; then
  TOTAL=$(npx remotion compositions src/index.ts 2>/dev/null | awk -v c="$COMP" '$1==c {print $4}')
  TOTAL=${TOTAL:-300}
  for i in 1 2 3 4 5 6 7 8 9; do FRAMES+=($(( TOTAL * i / 10 ))); done
fi
INPUTS=(); i=0
for f in "${FRAMES[@]}"; do
  npx remotion still src/index.ts "$COMP" "$TMP/$i.png" --frame="$f" --log=error >/dev/null
  INPUTS+=(-i "$TMP/$i.png"); i=$((i+1))
done
N=$i; COLS=3; [ "$N" -lt 3 ] && COLS=$N
LAYOUT=""; for ((k=0;k<N;k++)); do
  x=$(( k % COLS )); y=$(( k / COLS ))
  LAYOUT+="$( [ $k -gt 0 ] && echo '|' )$( [ $x -eq 0 ] && echo 0 || printf 'w0'; for ((j=1;j<x;j++)); do printf '+w0'; done )_$( [ $y -eq 0 ] && echo 0 || printf 'h0'; for ((j=1;j<y;j++)); do printf '+h0'; done )"
done
SCALE=""; for ((k=0;k<N;k++)); do SCALE+="[$k]scale=640:-2[s$k];"; done
STACK=""; for ((k=0;k<N;k++)); do STACK+="[s$k]"; done
ffmpeg -loglevel error -y "${INPUTS[@]}" -filter_complex "${SCALE}${STACK}xstack=inputs=$N:layout=$LAYOUT:fill=black" "$OUT"
rm -rf "$TMP"
echo "contact sheet: $OUT (frames: ${FRAMES[*]})"
