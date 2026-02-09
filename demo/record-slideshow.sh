#!/bin/bash
# MySkills Demo Video Recording

echo "🎬 MySkills Protocol Demo Video Recording"
echo "=========================================="
echo ""

# Check if slideshow exists
if [ ! -f "myskills-slideshow.html" ]; then
    echo "❌ slideshow not found"
    exit 1
fi

# Create videos directory
mkdir -p videos

echo "📍 Opening slideshow in browser..."
echo ""
echo "The slideshow will play for 72 seconds (5 slides × ~14s each)"
echo "Video will be automatically downloaded as myskills-demo.webm"
echo ""
echo "After recording:"
echo "1. Convert to MP4: ffmpeg -i myskills-demo.webm -c:v libx264 -crf 23 videos/myskills-demo.mp4"
echo "2. Upload video to hackathon platform"
echo ""

# Open in default browser
open myskills-slideshow.html

echo ""
echo "✅ Slideshow opened! Video will download automatically after 72 seconds."
echo ""
echo "💡 To manually record:"
echo "1. Use Cmd+Shift+5 (macOS) for screen recording"
echo "2. Record the slideshow for 60-90 seconds"
echo "3. Save as myskills-demo.mp4"
