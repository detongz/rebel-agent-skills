#!/bin/bash

# Simple x402 Demo Recording using macOS screencapture
OUTPUT_FILE="/Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/demo-video/x402-demo.mov"

echo "🎬 x402 Demo Recording - Simple Mode"
echo "===================================="
echo ""
echo "Instructions:"
echo "1. Open browser to http://localhost:3000/x402"
echo "2. Prepare to demonstrate the payment flow"
echo "3. This will record your ENTIRE screen"
echo ""
echo "Press Ctrl+C to stop recording"
echo ""
read -p "Press Enter to start recording..."

# Start recording (macOS native)
screencapture -V "$OUTPUT_FILE"

echo ""
echo "✅ Recording saved!"
echo "Location: $OUTPUT_FILE"
echo ""
echo "To convert to MP4 (if needed):"
echo "ffmpeg -i '$OUTPUT_FILE' -c:v libx264 -c:a aac '$OUTPUT_FILE.mov.mp4'"
