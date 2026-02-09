#!/bin/bash
# MySkills Demo - Quick Start
echo "🎬 MySkills Protocol Demo - Quick Start"
echo "======================================"
echo ""
echo "Opening demo pages..."
echo ""

# Open the Zhang demo slideshow
echo "📍 Opening Zhang Teacher Demo (auto-plays 90 seconds)..."
open demo/myskills-zhang-demo.html

sleep 2

# Open the main website
echo "📍 Opening MySkills website..."
open "https://myskills2026.ddttupupo.buzz"

# Check if OpenClaw is running
if curl -s http://127.0.0.1:18789/health > /dev/null 2>&1; then
    echo "📍 Opening OpenClaw Gateway..."
    open "http://127.0.0.1:18789/chat"
else
    echo "⚠️  OpenClaw Gateway not running"
fi

echo ""
echo "✅ Pages opened!"
echo ""
echo "🎬 To record:"
echo "   1. Press Cmd+Shift+5"
echo "   2. Select 'Record Entire Screen'"
echo "   3. Click 'Record'"
echo "   4. The Zhang demo auto-plays for 90 seconds"
echo "   5. Click 'Stop Recording' when done"
echo ""
echo "💾 Save video as: demo/videos/myskills-demo.mp4"
