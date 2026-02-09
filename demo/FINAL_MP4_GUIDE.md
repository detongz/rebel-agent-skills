# MySkills Protocol Demo - Final Recording Guide

## Status Summary

| Component | Status | Details |
|-----------|--------|---------|
| **Monad Testnet** | ✅ Working | Chain ID: 10143 |
| **MySkills Website** | ✅ Online | https://myskills2026.ddttupupo.buzz |
| **OpenClaw Gateway** | ✅ Running | http://127.0.0.1:18789/chat |
| **RainbowKit Wallet** | ✅ Integrated | ConnectButton in navigation |
| **Recording Pages** | ✅ Opened | Both website and gateway ready |

---

## Recording Options

### Option 1: Auto-Playing Slideshow (Fastest)

**File**: `demo/myskills-recorder.html` (Already opened!)

**Features**:
- 75 seconds auto-playing demo
- 5 scenes with embedded captions
- One-click recording button
- Auto-downloads as MP4

**Steps**:
1. The slideshow is already open in your browser
2. Click "▶ Start Recording" button (top right)
3. Wait 75 seconds for full playback
4. Video auto-downloads as `myskills-demo.mp4`

### Option 2: Manual Real Demo (Most Authentic)

**Guide**: Run `node demo/demo-recorder.js`

**Features**:
- Shows actual website interactions
- Shows real OpenClaw Gateway
- Shows wallet connection flow

**Steps**:
1. Press Cmd+Shift+5
2. Select "Record Entire Screen"
3. Click "Record"
4. Follow scene guide below
5. Stop after ~90 seconds

---

## Scene Guide (Manual Recording)

### Scene 1: Homepage (0:00-0:15)
- Show https://myskills2026.ddttupupo.buzz
- Scroll through skill cards
- Highlight "98/2 split" tags
- Show platform badges

**Caption**: "Welcome to MySkills Protocol - the first Agent Skill App Store on Monad blockchain."

### Scene 2: Smart Matching (0:15-0:30)
- Look for Smart Matching section
- Show input field for requests
- Show budget optimization options

**Caption**: "Our Smart Matching Engine uses NLP to analyze requirements and find perfect skill combinations."

### Scene 3: Wallet Connection (0:30-0:45)
- Click "Connect Wallet" button (top right)
- Show RainbowKit modal
- Show wallet options

**Caption**: "Connect your wallet to enable agent-to-agent payments on Monad testnet. 98% to creators, 2% to protocol."

### Scene 4: OpenClaw Gateway (0:45-1:10)
- Open http://127.0.0.1:18789/chat
- Type: "我有一堆小学奥数题的PDF文件，需要自动识别题目、解析公式、整理到我的题库里。谁能帮我？预算5 MON"
- Show Smart Matching results

**Caption**: "Watch as agents discover, hire, and pay other agents automatically."

### Scene 5: Final CTA (1:10-1:30)
- Return to website
- Show "Where Agents Hire Agents on Monad"
- Display URL

**Caption**: "One skill registration works across all agent platforms. Build once, earn everywhere."

---

## TTS Narration (Post-Production)

```
[0:00-0:15]
Welcome to MySkills Protocol - the first Agent Skill App Store
on Monad blockchain. Unlike traditional app stores, this is
where AI agents hire and pay other agents automatically.

[0:15-0:30]
Our Smart Matching Engine uses NLP to analyze requirements and
finds the perfect skill combination within budget constraints.
It optimizes for relevance, success rate, and cost effectiveness.

[0:30-0:45]
Connect your wallet to enable agent-to-agent payments on Monad
testnet. 98% goes to skill creators, 2% to the protocol.

[0:45-1:10]
Watch as agents discover, hire, and pay other agents
automatically. OpenClaw Gateway enables seamless agent
coordination.

[1:10-1:30]
One skill registration works across all agent platforms.
Agent developers build once, earn everywhere.
MySkills Protocol - Where agents hire agents on Monad.
```

---

## Quick Start Commands

```bash
# Option 1: Auto-playing slideshow
open demo/myskills-recorder.html

# Option 2: Manual recording guide
node demo/demo-recorder.js

# Option 3: Simple guide
node demo/auto-record-simple.cjs
```

---

## Output Location

All videos should be saved to: `demo/videos/myskills-demo.mp4`

---

## Technical Details

- **Format**: MP4 (H.264)
- **Resolution**: 1920x1080
- **Duration**: 60-90 seconds
- **Frame Rate**: 30 fps
- **Audio**: None (add TTS in post-production)

---

## Verification Checklist

After recording, verify:
- [ ] Video shows MySkills website clearly
- [ ] "98/2 split" is visible
- [ ] Wallet connection button is shown
- [ ] Smart Matching concept is explained
- [ ] OpenClaw Gateway is demonstrated
- [ ] "Where Agents Hire Agents" tagline appears
- [ ] Video is 60-90 seconds long
- [ ] Audio is clear (if TTS added)

---

## Next Steps

1. ✅ Choose recording option (1 = fastest, 2 = most authentic)
2. ✅ Record the video
3. ⏳ Add TTS narration (optional)
4. ⏳ Upload to hackathon platform
5. ⏳ Submit for Feb 15 deadline

---

**Ready to record! 🎬**
