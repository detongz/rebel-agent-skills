#!/bin/bash

# x402 Demo Recording Script
# This script records a screen capture of the x402 payment demo

OUTPUT_DIR="/Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/demo-video"
OUTPUT_FILE="$OUTPUT_DIR/x402-demo.mp4"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "🎬 x402 Demo Recording"
echo "====================="
echo ""
echo "This will record your screen demonstrating the x402 payment flow."
echo ""
echo "Prerequisites:"
echo "  1. Frontend dev server must be running (npm run dev)"
echo "  2. Browser should be open at http://localhost:3000/x402"
echo "  3. Wallet should be ready to connect"
echo ""
echo "Recording will capture the entire screen."
echo "Press Ctrl+C to stop recording."
echo ""
read -p "Press Enter to start recording..."

# Start recording using ffmpeg
# Using screen capture device (macOS)
ffmpeg -f avfoundation \
  -pix_fmt yuv420p \
  -framerate 30 \
  -video_size 1920x1080 \
  -i "1:none" \
  -c:v libx264 \
  -preset veryfast \
  -crf 22 \
  "$OUTPUT_FILE"

echo ""
echo "✅ Recording saved to: $OUTPUT_FILE"
echo ""
echo "To view the video:"
echo "  open '$OUTPUT_FILE'"
echo ""
echo "To upload or share the video, it's ready at:"
echo "  $OUTPUT_FILE"
