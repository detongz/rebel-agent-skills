# MySkills Blitz Pro Demo Video Script
**Track**: Direction B - Technical Demo (showcase x402 integration)
**Duration**: 2:3 minutes
**Deadline**: February 28, 2026

---

## Scene 1: Hook (0:00-0:10)
**Duration**: 10 seconds

### Visual
- Dark screen with typing text effect: "Agents need to pay agents."
- Pause, then fade in: "But they can't hold credit cards."
- Background: Subtle animated network of AI agents connecting
- Color scheme: Deep purple/black with neon green accents

### Voiceover
"Agents need to pay agents. But they can't hold credit cards."

### Technical Notes
- Use After Effects or Figma for typing animation
- Font: JetBrains Mono or SF Mono (developer aesthetic)
- Transition: Smooth fade to next scene

---

## Scene 2: Problem - Ethereum's Limitations (0:10-0:30)
**Duration**: 20 seconds

### Visual
- Split screen animation:
  - Left: Ethereum logo spinning slowly
  - Right side showing stats appearing with counting animation:
    - "15 TPS" (in red)
    - "$50+ average gas fee" (in red)
    - "Payment finality: 12+ seconds" (in orange)
  - Bottom: Failed transaction notification with "Payment Failed - Insufficient Gas"
- Animated timeline showing payment failures stacking up

### Voiceover
"Ethereum was built for humans, not agents. With just 15 transactions per second and volatile gas fees, micropayments become impossible. When an agent needs to pay $0.50 for an API call, a $50 gas fee makes no sense."

### Screen Recording Needed
- Etherscan showing high gas fees
- Failed transaction example on Ethereum mainnet

---

## Scene 3: Solution - MySkills on Monad (0:30-1:00)
**Duration**: 30 seconds

### Visual
- Logo animation: MySkills logo fades in
- Three-column comparison:
  - **Ethereum**: 15 TPS, $50 gas, 12s finality
  - **Other L2s**: 100 TPS, $5 gas, 2s finality
  - **Monad + MySkills**: 10,000 TPS, $0.001 gas, <1s finality (all in green)
- Animated payment flow diagram:
  - Agent → Payment Protocol → Resource Access
- Code snippet showing payment integration:

```typescript
const payment = await myskills.pay({
  to: "agent-id",
  amount: "10 ASKL",
  resource: "/api/analyze"
});
// Confirmed in 0.3s
```

### Voiceover
"MySkills is an agent-native payment protocol built on Monad. By leveraging x402 HTTP payment standards and Monad's 10,000 TPS architecture, we enable instant, low-cost micropayments between AI agents. Payments that cost pennies instead of dollars."

### Screen Recording Needed
- Terminal showing quick transaction confirmation
- Comparison dashboard (static or animated)

---

## Scene 4: x402 Protocol Demo (1:00-1:40)
**Duration**: 40 seconds

### Visual
**Split into 4 panels (appearing sequentially):**

1. **Panel 1 - Agent Request** (0:00-0:10):
   - Terminal showing curl request:
   ```bash
   curl -X POST https://api.myskills.xyz/analyze \
     -H "Agent-ID: agent-123" \
     -d '{"code": "..."}'
   ```

2. **Panel 2 - 402 Response** (0:10-0:20):
   - Server response appearing:
   ```http
   HTTP/1.1 402 Payment Required
   Payment-Required: 5 ASKL
   Payment-Address: 0x742d...F73a
   Payment-Metadata: resource-id-456
   ```

3. **Panel 3 - Payment Flow** (0:20-0:30):
   - Animation of ASKL token flowing from agent to facilitator
   - Confirmation modal: "Payment Confirmed ✓"

4. **Panel 4 - Content Delivered** (0:30-0:40):
   - Response with analysis results appearing
   - Transaction hash highlighted: 0x8f3a...B2c1

### Voiceover
"Here's how it works. When an agent requests a paid resource, the server returns HTTP 402 Payment Required with payment details. The MySkills protocol handles the payment automatically through the x402 facilitator, and once confirmed, the content is delivered. All in under a second."

### Screen Recordings Needed
- x402 Facilitator: https://x402-facilitator.molandak.org
- Terminal showing actual x402 flow
- Block explorer showing payment transaction

---

## Scene 5: MCP Integration Demo (1:40-2:10)
**Duration**: 30 seconds

### Visual
**Screen recording of Claude Desktop:**

1. **Claude Chat Interface** (0:00-0:15):
   ```
   User: "Tip the Solidity auditor 10 ASKL"
   Claude: I'll send 10 ASKL to solidity-auditor...
   ```

2. **MCP Server Response** (0:15-0:20):
   - Tool call animation:
   ```json
   {
     "tool": "tip_creator",
     "params": {
       "creator": "solidity-auditor",
       "amount": "10 ASKL"
     }
   }
   ```

3. **Transaction Confirmation** (0:20-0:25):
   - Success notification: "✓ Sent 10 ASKL"
   - Fee breakdown:
     - Amount: 10 ASKL
     - Fee: 0.2 ASKL
     - Received: 9.8 ASKL

4. **Explorer Popup** (0:25-0:30):
   - Block explorer showing transaction
   - Block number updating in real-time

### Voiceover
"Through our MCP integration, agents can trigger payments directly from Claude. Watch this: a simple tip command confirms instantly. The creator receives 9.8 out of 10 ASKL, with just 0.2 ASKL in protocol fees. All visible on-chain in real-time."

### Screen Recordings Needed
- Claude Desktop with MySkills MCP server
- MCP tool execution
- Monad block explorer

---

## Scene 6: Monad Performance (2:10-2:30)
**Duration**: 20 seconds

### Visual
- Animated bar chart comparing:
  - Ethereum: 15 TPS (tiny bar)
  - Solana: 1,000 TPS (medium bar)
  - Monad: 10,000 TPS (massive bar, highlighted)
- Real-time TPS counter showing current network activity
- Latency comparison:
  - "Time to finality: <1s"
  - "Cost per transaction: $0.001"

### Voiceover
"Monad's parallel execution delivers 10,000 transactions per second. That's 666x more than Ethereum. Perfect for the millions of daily agent-to-agent payments we're enabling."

### Screen Recording Needed
- Monad testnet explorer showing real-time blocks
- TPS chart or animation

---

## Scene 7: CTA (2:30-2:40)
**Duration**: 10 seconds

### Visual
- MySkills logo center screen
- Animated text appearing below:
  - "Agent-Native Payment Infrastructure"
  - "MySkills on Monad"
- Call to action:
  - "Start building: github.com/myskills"
  - "Join the community: discord.gg/TfzSeSRZ"
- Background: Subtle particle animation of agents connecting

### Voiceover
"Agent-native payment infrastructure. MySkills on Monad. Build the future of autonomous agent commerce."

---

## Technical Specifications

### Video Settings
- **Resolution**: 1920x1080 (16:9)
- **Frame Rate**: 30fps or 60fps
- **Format**: MP4 (H.264)
- **Bitrate**: 8-10 Mbps
- **Duration**: 2:40 (160 seconds)

### Color Palette
- **Primary**: #6366f1 (Indigo)
- **Secondary**: #10b981 (Emerald Green)
- **Background**: #0f0f1a (Deep Navy)
- **Text**: #ffffff (White)
- **Accent**: #f59e0b (Amber)

### Typography
- **Headings**: SF Pro Display / Inter (Bold, 700)
- **Code**: JetBrains Mono / SF Mono (Regular, 400)
- **Body**: SF Pro Text / Inter (Regular, 400)

### Background Music
- **Style**: Tech/Ambient electronic
- **Tempo**: 120-140 BPM
- **Mood**: Professional, innovative, forward-thinking
- **Volume**: -15dB (under voiceover)
- **Recommendations**:
  - "Digital Revolution" (Artlist)
  - "Tech Background" (Epidemic Sound)
  - "Future Bass" type beats

### Sound Effects
- Typing effect: Short, crisp keyboard sounds
- Success confirmation: Subtle "ding" or "chime"
- Transaction confirmation: Digital "whoosh"
- Payment flow: Subtle "cha-ching" (very brief)
- Logo animations: Low frequency "rumble"

---

## Screen Recording Checklist

### Must Record
- [ ] Claude Desktop with MySkills MCP server active
- [ ] MCP tool execution (tip_creator call)
- [ ] Transaction confirmation popup
- [ ] x402 Facilitator web interface: https://x402-facilitator.molandak.org
- [ ] 402 payment flow demonstration
- [ ] Monad block explorer showing transactions
- [ ] Terminal showing quick transaction confirmations
- [ ] Failed Ethereum transaction example

### Optional but Nice to Have
- [ ] Network topology animation
- [ ] Agent-to-agent payment visualization
- [ ] Real-time TPS monitoring
- [ ] Gas fee comparison chart

### Recording Tips
1. Use 2x or 3x resolution (3840x2160) for crisp downsampling
2. Clean desktop before recording (hide personal files)
3. Use light mode for code, dark mode for interfaces
4. Zoom in on important UI elements
5. Add mouse click highlights (yellow circles)
6. Record each segment separately for easier editing
7. Include 3-5 seconds of padding before/after each action

---

## Post-Production Notes

### Transitions
- Scene 1→2: Fade (0.5s)
- Scene 2→3: Slide left (0.3s)
- Scene 3→4: Zoom in (0.3s)
- Scene 4→5: Cut (immediate)
- Scene 5→6: Fade (0.5s)
- Scene 6→7: Zoom out (0.5s)

### Effects
- Add subtle motion blur to fast animations
- Use easing functions (ease-in-out) for smooth movements
- Add vignette to frame important elements
- Use parallax effect on layered animations

### Export Settings (for Remotion)
- Individual scenes as separate clips
- ProRes 422 or DNxHD (high quality)
- Include alpha channel where needed
- Export at source resolution (1920x1080)

---

## Submission Checklist

- [ ] Video length: 2:00-3:00 (target: 2:40)
- [ ] Resolution: 1920x1080 minimum
- [ ] Format: MP4
- [ ] English narration with clear audio
- [ ] Subtitles/captions for accessibility
- [ ] Demonstrate x402 integration clearly
- [ ] Show MCP functionality
- [ ] Highlight Monad benefits
- [ ] Include GitHub/Discord links
- [ ] File size < 500MB (for upload)

---

## Timeline for Production

### Week 1 (Feb 17-23)
- [ ] Record all screen captures
- [ ] Set up Remotion project
- [ ] Create base components
- [ ] Record voiceover

### Week 2 (Feb 24-28)
- [ ] Build all scenes in Remotion
- [ ] Add animations and transitions
- [ ] Sync audio and visuals
- [ ] Export and review
- [ ] Final edits and submission

---

## Notes for Video Editor

1. **Pacing**: Keep it fast but not rushed. Each scene should feel complete.
2. **Code Snippets**: Make sure they're readable. Use high contrast.
3. **Network Activity**: Show, don't just tell. Real transactions > animations.
4. **MCP Demo**: This is crucial. Make it clear agents are paying agents.
5. **Monad Focus**: Emphasize why Monad matters (speed, cost).
6. **CTA**: Make it actionable. Clear next steps for developers.

---

## References

- **x402 Protocol**: https://x402.org
- **x402 Facilitator**: https://x402-facilitator.molandak.org
- **Monad Documentation**: https://docs.monad.xyz
- **MySkills GitHub**: (add repository URL)
- **Blitz Pro Rules**: (add official URL)

---

**Script Version**: 1.0
**Last Updated**: 2026-02-08
**Status**: Draft - Ready for Recording
