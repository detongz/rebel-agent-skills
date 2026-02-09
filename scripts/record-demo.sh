#!/bin/bash

# Hackathon Demo Recording Script
# Records both Moltiverse and Blitz Pro demos

set -e

VIDEO_DIR="videos"
MOLTIVERSE_DEMO="$VIDEO_DIR/moltiverse-demo.mp4"
BLITZ_PRO_DEMO="$VIDEO_DIR/blitz-pro-demo.mp4"
BASE_URL="http://localhost:3000"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🎬 Hackathon Demo Recording${NC}"
echo ""
echo "📋 Recording Plan:"
echo "   1. Moltiverse Demo (2:00) - Agent Bounty Marketplace"
echo "   2. Blitz Pro Demo (1:30) - x402 Payment Protocol"
echo ""

# Create video directory
mkdir -p "$VIDEO_DIR"

# Function to record screen
record_screen() {
    local duration=$1
    local output=$2
    local title=$3

    echo -e "${YELLOW}🎬 Recording: $title${NC}"
    echo "   Duration: ${duration}s"
    echo "   Output: $output"
    echo ""
    echo "   📍 Starting in 3 seconds..."
    echo "   ⌨️  Press Ctrl+C to stop early"
    echo ""

    sleep 3

    # Record using ffmpeg
    ffmpeg -f avfoundation \
        -i "0" \
        -r 30 \
        -s 1920x1080 \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -c:a aac \
        -b:a 128k \
        -t "$duration" \
        "$output" \
        -y \
        2>/dev/null || true

    echo -e "${GREEN}✅ Recording complete: $output${NC}"
    echo ""
}

# Check if dev server is running
echo "🔍 Checking dev server..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Dev server not running at $BASE_URL"
    echo "   Please start with: cd frontend && npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Dev server running${NC}"
echo ""

# Record Moltiverse demo
record_screen 120 "$MOLTIVERSE_DEMO" "Moltiverse Agent Bounty Marketplace"

# Give time to prepare for second recording
echo "⏸️  Preparing for second recording..."
echo "   Navigate to: $BASE_URL/demo-blitz-pro"
echo ""
sleep 5

# Record Blitz Pro demo
record_screen 90 "$BLITZ_PRO_DEMO" "Blitz Pro x402 Protocol"

echo -e "${GREEN}🎉 All recordings complete!${NC}"
echo ""
echo "📁 Video files:"
ls -lh "$MOLTIVERSE_DEMO" "$BLITZ_PRO_DEMO" 2>/dev/null || echo "   No videos created"
echo ""
echo -e "${GREEN}✅ Ready for hackathon submission!${NC}"
