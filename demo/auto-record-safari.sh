#!/bin/bash
# Auto-record Safari with screencapture

echo "🎬 Auto-Recording Safari Demo..."
echo "================================"
echo ""

mkdir -p demo/videos
OUTPUT="demo/videos/myskills-safari-demo.mp4"

# Open Safari with OpenClaw
echo "📍 Opening Safari with OpenClaw..."
osascript -e 'tell application "Safari"' \
  -e 'activate' \
  -e 'set URL of document 1 to "http://127.0.0.1:18789/#token=511ce9ce2abf5ec3faacc1b5d2c58a7f29bf6d26efcc2ab98f5f8d9da32723c2"' \
  -e 'end tell' > /dev/null 2>&1

sleep 5

echo ""
echo "🔴 Starting screen recording for 90 seconds..."
echo "   Demo will proceed automatically..."
echo ""

# Start recording in background
ffmpeg -f avfoundation -i "0" -t 90 -r 30 \
  -c:v libx264 -preset fast -crf 23 \
  "$OUTPUT" > /tmp/ffmpeg.log 2>&1 &

FFMPEG_PID=$!

# Demo automation with delays
echo "📍 Scene 1: OpenClaw Gateway (0:00-0:15)"
sleep 15

echo "📍 Scene 2: Typing request (0:15-0:30)"
# Use AppleScript to type
osascript -e 'tell application "System Events"' \
  -e 'keystroke "我有一堆小学奥数题的PDF文件"' \
  -e 'end tell' > /dev/null 2>&1

sleep 15

echo "📍 Scene 3: Switch to MySkills (0:30-0:60)"
osascript -e 'tell application "Safari"' \
  -e 'tell window 1' \
  -e 'set current tab to tab 2' \
  -e 'end tell' \
  -e 'end tell' > /dev/null 2>&1

sleep 20

echo "📍 Scene 4: Scroll MySkills (0:60-0:75)"
osascript -e 'tell application "System Events"' \
  -e 'key code 125'  # Page Down \
  -e 'end tell' > /dev/null 2>&1

sleep 15

echo "📍 Scene 5: Final CTA (0:75-0:90)"
sleep 15

echo ""
echo "✅ Recording complete!"
echo "📹 Video saved to: $OUTPUT"
echo ""

# Wait for ffmpeg to finish
wait $FFMPEG_PID 2>/dev/null

if [ -f "$OUTPUT" ]; then
    echo "✅ $OUTPUT created!"
    ls -lh "$OUTPUT"
else
    echo "⚠️  Video file not created. Check /tmp/ffmpeg.log"
fi
