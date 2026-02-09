#!/bin/bash
# MySkills Demo Auto-Recording Script

echo "🎬 Starting MySkills demo recording..."

# 方法1: 尝试使用 screencapture (macOS内置)
if command -v screencapture &> /dev/null; then
    echo "Using macOS screencapture..."
    screencapture -R0,0,1920,1080 -t90 myskills-demo.mov &
    RECORD_PID=$!
    echo "Recording for 90 seconds..."
    sleep 90
    kill $RECORD_PID 2>/dev/null
    
    if [ -f myskills-demo.mov ]; then
        echo "✅ Recording saved: myskills-demo.mov"
        echo "Size: $(ls -lh myskills-demo.mov | awk '{print $5}')"
        exit 0
    fi
fi

# 方法2: 使用 ffmpeg (如果可用)
if command -v ffmpeg &> /dev/null; then
    echo "Using ffmpeg..."
    # 尝试不同的设备索引
    for device in "0:none" "1:0" "0:0"; do
        echo "Trying device: $device"
        timeout 5 ffmpeg -f avfoundation -i "$device" -t 1 -y /tmp/test.mp4 2>/dev/null && {
            echo "Device $device works!"
            ffmpeg -f avfoundation -i "$device" -t 90 -r 30 -pix_fmt uyvy422 -vf "scale=1920:1080" myskills-demo.mp4 &
            RECORD_PID=$!
            echo "Recording for 90 seconds..."
            sleep 90
            kill $RECORD_PID 2>/dev/null
            
            if [ -f myskills-demo.mp4 ]; then
                echo "✅ Recording saved: myskills-demo.mp4"
                echo "Size: $(ls -lh myskills-demo.mp4 | awk '{print $5}')"
                exit 0
            fi
        }
    done
fi

echo "❌ All recording methods failed"
echo ""
echo "Please use manual recording:"
echo "1. Press Cmd+Shift+5 (macOS)"
echo "2. Open https://myskills2026.ddttupupo.buzz"
echo "3. Record for 60-90 seconds showing:"
echo "   - Homepage with skill cards"
echo "   - 98/2 split tags"
echo "   - Cross-platform badges"
echo "4. Stop recording and save"
