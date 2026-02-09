#!/bin/bash
echo "🎬 Recording MySkills Demo to MP4..."

# 方法1: 使用 ffmpeg 捕获屏幕 (需要屏幕录制权限)
if command -v ffmpeg &> /dev/null; then
    echo "Using ffmpeg to record..."
    
    # 打开幻灯片
    open myskills-slideshow.html
    sleep 3
    
    # 录制75秒
    echo "Recording for 75 seconds..."
    ffmpeg -f avfoundation -i "0:0" -t 75 -r 30 -pix_fmt uyvy422 -vf "scale=1920:1080" -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k myskills-demo.mp4 2>&1 &
    RECORD_PID=$!
    
    echo "Recording in progress (PID: $RECORD_PID)"
    echo "Slideshow is playing..."
    sleep 75
    kill $RECORD_PID 2>/dev/null
    
    if [ -f myskills-demo.mp4 ]; then
        echo ""
        echo "✅ Recording complete!"
        echo "📁 File: demo/myskills-demo.mp4"
        echo "📊 Size: $(ls -lh myskills-demo.mp4 | awk '{print $5}')"
        exit 0
    fi
fi

# 方法2: 使用 screencapture (macOS 内置)
if command -v screencapture &> /dev/null; then
    echo "Using macOS screencapture..."
    
    open myskills-slideshow.html
    sleep 3
    
    echo "Recording for 75 seconds..."
    screencapture -R0,0,1920,1080 -t75 myskills-demo.mov
    
    if [ -f myskills-demo.mov ]; then
        echo "Converting to MP4..."
        ffmpeg -i myskills-demo.mov -c:v libx264 -crf 23 myskills-demo.mp4 2>/dev/null
        
        if [ -f myskills-demo.mp4 ]; then
            echo ""
            echo "✅ Recording complete!"
            echo "📁 File: demo/myskills-demo.mp4"
            echo "📊 Size: $(ls -lh myskills-demo.mp4 | awk '{print $5}')"
            rm myskills-demo.mov
            exit 0
        fi
    fi
fi

echo ""
echo "❌ Auto-recording failed"
echo ""
echo "Please record manually:"
echo "1. macOS: Cmd+Shift+5 → Record screen → Save as MP4"
echo "2. Or use QuickTime Player: File → New Screen Recording"
