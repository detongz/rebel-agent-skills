#!/bin/bash
# Auto-record OpenClaw Demo

echo "🎬 Auto-Recording OpenClaw Demo"
echo "================================"
echo ""

# Create videos directory
mkdir -p demo/videos

OUTPUT="demo/videos/myskills-openclaw-demo.mp4"
DURATION=95  # seconds

echo "📍 Opening demo pages..."

# Open OpenClaw with token
open "http://127.0.0.1:18789/#token=511ce9ce2abf5ec3faacc1b5d2c58a7f29bf6d26efcc2ab98f5f8d9da32723c2"
sleep 2

# Open MySkills website
open "https://myskills2026.ddttupupo.buzz"
sleep 2

echo ""
echo "🎬 Starting recording in 5 seconds..."
echo "   Please switch to the browser window"
echo ""

sleep 5

# Try ffmpeg recording
echo "🔴 Recording... (will stop after ${DURATION}s)"
echo ""

ffmpeg -f avfoundation \
  -i "0" \
  -t $DURATION \
  -pix_fmt uyvy422 \
  -c:v libx264 \
  -preset fast \
  -crf 23 \
  "$OUTPUT" 2>&1 &

FFMPEG_PID=$!

# Countdown
for i in {1..10}; do
  echo "⏳ $i/10 seconds..."
  sleep 1
done

echo ""
echo "✅ Recording complete!"
echo "📹 Video saved to: $OUTPUT"
echo ""

# Stop ffmpeg
kill $FFMPEG_PID 2>/dev/null

echo "💡 To stop early: press Ctrl+C"
