# x402 Demo Video Recording Guide

## Prerequisites Checklist

- ✅ Frontend dev server running on port 3000
- ✅ Browser ready at http://localhost:3000/x402
- ✅ Wallet configured (RainbowKit/WalletConnect)
- ✅ Testnet USDC available in wallet (optional for demo)

---

## Demo Script (30-60 seconds)

### Opening Scene (5 seconds)
1. Show the x402 demo page in full view
2. **Narration**: "Welcome to Agent Reward Hub's x402 payment demo. This showcases agent-native micropayments on Monad testnet."

### Configuration Display (5 seconds)
1. Point to the configuration section
2. **Narration**: "We're using Monad testnet with chain ID 10143, and the x402 facilitator for seamless payments."

### Wallet Connection (10 seconds)
1. Click "Connect Wallet"
2. Show RainbowKit modal appearing
3. **Narration**: "Connecting your wallet is simple with RainbowKit integration."

### Payment Demonstration (20-30 seconds)
1. Hover over "Skill Access" service ($0.001)
2. Click "Pay $0.001"
3. **Key Point**: Show that NO MetaMask popup appears
4. **Narration**: "Notice something missing? No wallet popup! x402 handles payments in the background."
5. Show success message appearing
6. **Narration**: "Payment confirmed instantly. The service is now unlocked."

### Multiple Services (10 seconds)
1. Click "Pay $0.01" for Post Bounty
2. Show another successful payment
3. **Narration**: "Multiple payment tiers work seamlessly."

### Closing Scene (5 seconds)
1. Show all 4 services available
2. **Narration**: "Agent-native payments, no popups, instant confirmation. That's the power of x402 on Monad."

---

## Recording Options

### Option 1: Automated Script (Recommended)
```bash
cd /Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/demo-video
./record-x402-demo.sh
```

### Option 2: Manual macOS Screen Recording
```bash
# Press Cmd+Shift+5 to open screen recording controls
# Select the portion of screen showing the demo
# Click record
```

### Option 3: OBS Studio (if installed)
- Set capture area to browser window
- Start recording
- Perform demo actions
- Stop recording

---

## Tips for Great Demo

1. **Clear Browser**: Use incognito/private mode or clear cache
2. **Window Size**: Use 1920x1080 or 16:9 aspect ratio
3. **Smooth Mouse**: Move mouse deliberately, not too fast
4. **Wait Times**: Pause 1-2 seconds after each action
5. **Highlight Key Feature**: Emphasize "no MetaMask popup"

---

## Expected File Output

- **Location**: `/Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/demo-video/x402-demo.mp4`
- **Duration**: 30-60 seconds
- **Quality**: 1080p, 30fps
- **Format**: MP4 (H.264)

---

## Troubleshooting

### Issue: Dev server not running
```bash
cd /Users/zhangdetong/Documents/workspace/gzh/agent-reward-hub/frontend
npm run dev
```

### Issue: Wrong network in wallet
- Ensure wallet is connected to Monad Testnet (Chain ID: 10143)
- Add network manually if not auto-detected

### Issue: Payment not working
- Check browser console for errors
- Verify API route is accessible: `curl http://localhost:3000/api/x402/pay/skill-access`

---

## Post-Recording

1. **Review the video** to ensure smooth flow
2. **Trim if needed** using QuickTime or ffmpeg:
   ```bash
   ffmpeg -i x402-demo.mp4 -ss 00:00:05 -to 00:01:00 -c copy x402-demo-trimmed.mp4
   ```
3. **Add subtitles/annotations** if desired (using video editing software)
4. **Export final version** for hackathon submission

---

## Demo URL for Reference

- **Page**: http://localhost:3000/x402
- **API Docs**: See test report in same directory
- **x402 Docs**: https://docs.x402.org

---

**Status**: ✅ Ready to record!
