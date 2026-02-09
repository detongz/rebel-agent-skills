#!/bin/bash
# MySkills Demo - 真实自动化录制
# 这个脚本会用 osascript 控制 Safari 自动演示

echo "🎬 MySkills 真实自动化录制"
echo "======================="
echo ""

mkdir -p demo/videos

# 打开 Safari
echo "📍 打开 Safari..."
osascript -e 'tell application "Safari" to activate' 2>/dev/null
sleep 2

# 打开 MySkills 网站（因为 OpenClaw 可能不稳定，先用可用的）
echo "📍 打开 MySkills 网站..."
osascript << 'EOF'
tell application "Safari"
    activate
    tell window 1
        set URL of document 1 to "https://myskills2026.ddttupupo.buzz"
    end tell
end tell
EOF

sleep 5

echo ""
echo "🔴 开始 90 秒自动化演示..."
echo ""

# 使用 ffmpeg 录制
ffmpeg -f avfoundation -i "0" -t 90 -r 30 \
    -c:v libx264 -preset fast -crf 23 \
    demo/videos/myskills-auto.mp4 > /tmp/ffmpeg.log 2>&1 &

FFPID=$!

# 自动化演示脚本
echo "📍 Scene 1: Homepage (0:00-0:15)"
sleep 15

echo "📍 Scene 2: 滚动显示技能卡片 (0:15-0:30)"
osascript << 'EOF'
tell application "System Events"
    keystroke page down
end tell
EOF
sleep 7

osascript << 'EOF'
tell application "System Events"
    keystroke page down
end tell
EOF
sleep 8

echo "📍 Scene 3: 回到顶部 (0:30-0:35)"
osascript << 'EOF'
tell application "System Events"
    keystroke home
end tell
EOF
sleep 5

echo "📍 Scene 4: 显示钱包连接 (0:35-0:50)"
sleep 15

echo "📍 Scene 5: Final CTA (0:50-1:30)"
sleep 40

echo ""
echo "✅ 录制完成!"

# 等待 ffmpeg
wait $FFPID 2>/dev/null

ls -lh demo/videos/myskills-auto.mp4 2>/dev/null && echo "📹 视频已创建" || echo "⚠️  视频创建失败"
