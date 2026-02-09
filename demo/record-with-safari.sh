#!/bin/bash
# Record OpenClaw Demo with Safari and AppleScript

echo "🎬 Recording OpenClaw Demo with Safari..."
echo "==========================================="
echo ""

mkdir -p demo/videos

# Open Safari with OpenClaw
echo "📍 Opening Safari with OpenClaw..."
osascript -e 'tell application "Safari"' \
  -e 'make new document with properties {URL:"http://127.0.0.1:18789/#token=511ce9ce2abf5ec3faacc1b5d2c58a7f29bf6d26efcc2ab98f5f8d9da32723c2"}' \
  -e 'end tell' > /dev/null 2>&1

sleep 3

# Also open MySkills website
echo "📍 Opening MySkills website..."
osascript -e 'tell application "Safari"' \
  -e 'tell window 1' \
  -e 'make new tab with properties {URL:"https://myskills2026.ddttupupo.buzz"}' \
  -e 'end tell' \
  -e 'end tell' > /dev/null 2>&1

echo ""
echo "✅ Safari opened with demo pages"
echo ""
echo "🎬 Now record with Cmd+Shift+5"
echo ""
echo "📋 Demo script:"
echo ""
echo "1. Tab 1: OpenClaw Gateway"
echo "2. Type: 我有一堆小学奥数题的PDF文件，需要自动识别题目、解析公式、整理到我的题库里。谁能帮我？预算5 MON"
echo "3. Wait for Smart Matching response"
echo "4. Tab 2: MySkills website - show 98/2 split"
echo "5. Final CTA"
echo ""
