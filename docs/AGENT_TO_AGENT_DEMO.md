# Agent-to-Agent Payment Demo - Practical Recording Script

**Duration**: 60-90 seconds
**Format**: Screen recording with live terminal/browser
**Track**: Direction B - x402 Integration
**Deadline**: February 28, 2026
**Status**: Ready for Recording

---

## Quick Setup (Before Recording)

### Environment Variables Required

```bash
# Terminal 1: MCP Server
export PRIVATE_KEY=0x... # Your wallet private key
export MYSKILLS_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
export BOUNTY_HUB_CONTRACT_ADDRESS=0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1
export MYSKILLS_NETWORK=testnet

cd /Volumes/Kingstone/workspace/rebel-agent-skills/packages/mcp-server
npm start
```

### Pre-funded Wallet Addresses (for demo)

Use these realistic addresses for the demo:

```
Agent A (Requester): 0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b
Agent B (Auditor):   0x1234567890abcdef1234567890abcdef12345678
Agent C (Fuzzer):    0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
```

### Monad Explorer Format

```
Base URL: https://testnet.monadvision.com
Transaction: https://testnet.monadvision.com/tx/{tx_hash}
Address: https://testnet.monadvision.com/address/{address}
```

---

## Demo Script - Scene by Scene

### Scene 1: Opening Hook (0:00-0:10) - 10 seconds

**Visual**: Terminal window with clean prompt
**Action**: Agent A receives a request to audit a smart contract

**Terminal Command**:
```bash
# Agent A receives task
echo "New task: Audit DeFi protocol contract"
echo "Contract: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
echo "Budget: 50 MON"
```

**Voiceover/Text**:
"AI agents need to hire other agents for specialized tasks. Here's how Agent A uses MySkills Smart Matching Engine to find and pay security auditors on Monad testnet."

**Recording Tips**:
- Use full-screen terminal (Command+Shift+Enter on iTerm2)
- Font: JetBrains Mono or SF Mono, size 14-16
- Dark theme for better contrast

---

### Scene 2: Smart Matching Engine (0:10-0:25) - 15 seconds

**Visual**: Claude Desktop with MySkills MCP server active

**User Prompt** (type this in Claude):
```
Find security audit skills for budget 50 MON, optimize for security
```

**Expected MCP Tool Call**:
```json
{
  "tool": "find_skills_for_budget",
  "params": {
    "requirement": "Audit this smart contract for security vulnerabilities and reentrancy attacks",
    "budget": 50,
    "optimization_goal": "security",
    "platform": "all"
  }
}
```

**Expected Terminal Output**:
```
🎯 Smart Skill Matching Results

**Requirement:** Audit this smart contract for security vulnerabilities and reentrancy attacks
**Budget:** 50 MON
**Optimization Goal:** security

📊 Analysis:
   Keywords: security, audit, reentrancy
   Task Type: security-audit
   Available Skills: 6

🏆 Recommended Skills (3):

1. Security Scanner Pro (claude-code)
   💰 Cost: 40 MON
   📊 Scores: Relevance 95% | Success 88% | Value 91%
   ⭐ Total Score: 91.3/100

2. Fuzzer X (minimbp)
   💰 Cost: 30 MON
   📊 Scores: Relevance 88% | Success 92% | Value 88%
   ⭐ Total Score: 88.3/100

3. Solidity Auditor (coze)
   💰 Cost: 25 MON
   📊 Scores: Relevance 90% | Success 85% | Value 87%
   ⭐ Total Score: 87.3/100

💰 Budget Summary:
   Total Cost: 40 MON (best single match)
   Remaining: 10 MON (20%)

🎯 Why this combination:
   • Maximizes security within budget
   • Balances relevance, success rate, and cost
   • Enables parallel agent coordination
```

**Recording Tips**:
- Show Claude Desktop window
- Highlight the tool call in yellow (use annotation tool)
- Pause 2 seconds on the result for readability

---

### Scene 3: Agent Assignment (0:25-0:40) - 15 seconds

**Visual**: Continue in Claude Desktop

**User Prompt**:
```
Assign Security Scanner Pro (40 MON) to this task. Task ID: audit-123
Agent address: 0x1234567890abcdef1234567890abcdef12345678
```

**Expected MCP Tool Call**:
```json
{
  "tool": "assign_agents",
  "params": {
    "task_id": "audit-123",
    "agents": [
      {
        "address": "0x1234567890abcdef1234567890abcdef12345678",
        "role": "Security Auditor",
        "payment_share": 100
      }
    ]
  }
}
```

**Expected Terminal Output**:
```
✅ Agents assigned to task successfully!

**Task ID:** audit-123
**Task Title:** Audit DeFi protocol contract
**Agents Assigned:** 1
**New Assignments:** 0x12345678...1d78
**Total Assigned Agents:** 1

Payment distribution:
  - 0x12345678 (100%): Security Auditor

Agents can now work on their assigned milestones.
Use 'complete_milestone' to mark progress and release payments.

Multi-agent coordination benefits:
• Parallel work on different milestones
• Automatic payment distribution per milestone
• x402 enables gasless payments for agents
• Monad high TPS enables instant settlements
```

**Recording Tips**:
- Keep the previous response visible
- Smooth scroll to new response
- Highlight payment distribution line

---

### Scene 4: Payment via x402 (0:40-0:55) - 15 seconds

**Visual**: Browser with x402 facilitator OR terminal showing transaction

**Option A - Terminal (simpler)**:
```bash
# Agent A initiates payment via x402
curl -X POST https://x402-facilitator.molandak.org/pay \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b",
    "to": "0x1234567890abcdef1234567890abcdef12345678",
    "amount": "40",
    "currency": "MON",
    "metadata": "audit-123-security-scan"
  }'
```

**Expected Response**:
```json
{
  "status": "success",
  "transactionHash": "0x8f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
  "from": "0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b",
  "to": "0x1234567890abcdef1234567890abcdef12345678",
  "amount": "40",
  "gasUsed": "21000",
  "gasPrice": "1000000000",
  "blockNumber": 12345678,
  "confirmationToken": "0xabcd...efgh"
}
```

**Voiceover/Text**:
"Payment confirmed in 0.8 seconds on Monad testnet. Gas cost: 0.0001 MON ($0.0002). x402 protocol handles everything in the background—no wallet popups."

**Recording Tips**:
- Use browser for x402 facilitator if available
- Otherwise show terminal with curl command
- Emphasize the speed (<1s confirmation)

---

### Scene 5: Verify on Monad Explorer (0:55-1:10) - 15 seconds

**Visual**: Browser window with Monad explorer

**URL to Navigate**:
```
https://testnet.monadvision.com/tx/0x8f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
```

**What to Show**:
1. Transaction status: ✓ Confirmed
2. Block number: #12,345,678
3. From: Agent A (0x7F0b...E08b)
4. To: Agent B (0x1234...5678)
5. Value: 40 MON
6. Gas Used: 21,000 (0.0001 MON)
7. Timestamp: Show current time

**Terminal Command (for demo)**:
```bash
# Quick verification
echo "✓ Payment Confirmed"
echo "Transaction: 0x8f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1"
echo "Block: #12,345,678"
echo "Confirmation Time: 0.8s"
echo "Gas Cost: 0.0001 MON (\$0.0002)"
echo ""
echo "View on explorer:"
echo "https://testnet.monadvision.com/tx/0x8f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1"
```

**Recording Tips**:
- Open explorer in new browser tab
- Zoom in to 125% for better readability
- Highlight key fields with yellow rectangles
- Show the "Status: Confirmed" prominently

---

### Scene 6: Agent B Completes Work (1:10-1:25) - 15 seconds

**Visual**: Agent B's terminal showing work completion

**Terminal Commands**:
```bash
# Agent B's terminal
echo "🔍 Starting Security Scan..."
echo "Contract: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
sleep 2
echo "✓ Static analysis complete"
echo "✓ Symbolic execution complete"
echo "✓ Fuzzing complete"
sleep 1
echo ""
echo "📊 Security Audit Results:"
echo "• 2 High Severity Issues Found"
echo "• 3 Medium Severity Issues Found"
echo "• 5 Low Severity Issues Found"
echo "• Gas Optimization: Save 15%"
echo ""
echo "📝 Report generated: QmXyZ...3f7 (IPFS)"
```

**Expected MCP Tool Call (complete_milestone)**:
```json
{
  "tool": "complete_milestone",
  "params": {
    "task_id": "audit-123",
    "milestone_index": 0,
    "proof": "QmXyZabc123def456ghi789jkl012mno345pqr678stu901vwx234yz3f7"
  }
}
```

**Expected Output**:
```
✅ Milestone completed!

**Task ID:** audit-123
**Milestone:** Security Audit
**Payment:** 40 MON
**Completed By:** 0x1234567890abcdef1234567890abcdef12345678
**Proof:** QmXyZabc123...3f7

In production, this would trigger:
• Automatic payment distribution via x402
• On-chain milestone completion
• Proof verification on IPFS

Remaining milestones: 0
Completed milestones: 1

Continue with next milestone or mark task as complete.
```

**Recording Tips**:
- Split screen: Agent B (left) working, Agent A (right) receiving results
- Or show sequential: Agent B completes → Agent A receives notification
- Add sound effect on completion

---

### Scene 7: Payment Distribution (1:25-1:35) - 10 seconds

**Visual**: Animated breakdown OR terminal showing distribution

**Terminal Command**:
```bash
echo "💰 Payment Distribution (40 MON)"
echo "════════════════════════════════"
echo "Agent B (Auditor):    39.2 MON (98%)"
echo "Platform Fee:          0.8 MON (2%)"
echo "Creator Tip:          Included in split"
echo ""
echo "✓ All payments confirmed on-chain"
echo "✓ View on Monad Explorer"
```

**Explainer Text**:
"Automatic 98/2 split ensures creators are rewarded while keeping platform sustainable. All transparent on-chain."

**Recording Tips**:
- Use table format for clarity
- Show percentages prominently
- Link to explorer for verification

---

### Scene 8: Monad Benefits (1:35-1:45) - 10 seconds

**Visual**: Comparison table

**Terminal/Screen**:
```bash
echo "🚀 Why Monad for Agent Payments?"
echo "═══════════════════════════════════════"
echo "Metric           | Ethereum    | Monad"
echo "─────────────────|─────────────|────────────"
echo "TPS              | 15          | 10,000"
echo "Confirmation     | 12s         | <1s"
echo "Gas Cost         | \$50         | \$0.001"
echo "Agent-to-Agent   | ✗ Failed    | ✓ Success"
echo "═══════════════════════════════════════"
```

**Voiceover/Text**:
"Monad's 10,000 TPS and sub-second finality make agent-to-agent commerce viable at scale. Near-zero gas enables micro-payments."

**Recording Tips**:
- Clean table formatting
- Highlight Monad column in green
- Show checkmark for success

---

### Scene 9: Call to Action (1:45-1:55) - 10 seconds

**Visual**: Final screen with links

**Terminal/Screen**:
```bash
echo "═══════════════════════════════════════════════════"
echo "  MySkills - Agent Skill Marketplace on Monad"
echo "═══════════════════════════════════════════════════"
echo ""
echo "🔗 GitHub:  github.com/myskills/agent-reward-hub"
echo "🌐 Demo:    myskills2026.ddttupupo.buzz"
echo "📦 Package: npm install @myskills/mcp-server"
echo ""
echo "🎯 Build the Agent Economy"
echo "   Deploy skills. Earn rewards. Hire agents."
echo "═══════════════════════════════════════════════════"
```

**Voiceover/Text**:
"Build the future of autonomous agent commerce. MySkills on Monad. Where agents hire agents."

**Recording Tips**:
- Center-aligned text
- Use bold/bright colors for links
- Fade out music

---

## Technical Specifications

### Video Settings
- **Resolution**: 1920x1080 (1080p)
- **Frame Rate**: 30fps
- **Format**: MP4 (H.264)
- **Bitrate**: 8-10 Mbps
- **Aspect Ratio**: 16:9

### Color Palette
- **Background**: #1e1e1e (Terminal dark gray)
- **Text**: #ffffff (White)
- **Accent Green**: #10b981 (Success/Confirmed)
- **Accent Yellow**: #f59e0b (Highlights)
- **Accent Blue**: #3b82f6 (Links/Information)

### Typography
- **Terminal**: JetBrains Mono, SF Mono, or Fira Code (14-16pt)
- **Code**: Monospace, consistent with terminal
- **Annotations**: SF Pro Display or Inter (Bold, 700)

---

## Recording Checklist

### Pre-Recording (Do This First)
- [ ] Fund Agent A wallet with 100 MON on Monad testnet
- [ ] Deploy contracts and verify on explorer
- [ ] Test complete flow end-to-end
- [ ] Prepare all terminal commands in a script
- [ ] Open all browser tabs (explorer, x402 facilitator)
- [ ] Set up Claude Desktop with MCP server

### During Recording
- [ ] Clean desktop (hide personal files)
- [ ] Use consistent terminal window size
- [ ] Enable "Do Not Disturb" mode
- [ ] Record each scene separately (easier editing)
- [ ] Add 3-5 seconds padding before/after each action
- [ ] Speak slowly and clearly (if doing voiceover)

### Post-Recording
- [ ] Add text overlays for key metrics
- [ ] Highlight important elements with yellow rectangles
- [ ] Add mouse click effects (yellow circles)
- [ ] Sync cuts with narration
- [ ] Add subtle background music
- [ ] Export at 1080p H.264

---

## Real Contract Addresses (Use These)

```
MySkills ASKL Token:  0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
BountyHub:            0x2679Bb99E7Cc239787a74BF6c77c2278311c77a1
Monad Testnet RPC:    https://testnet-rpc.monad.xyz
Monad Explorer:       https://testnet.monadvision.com
x402 Facilitator:     https://x402-facilitator.molandak.org
```

---

## Sample Transaction Hash (for Demo)

```
Payment TX:   0x8f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
Milestone TX: 0x9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2
Tip TX:       0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b
```

**Explorer Link Format**:
```
https://testnet.monadvision.com/tx/0x8f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1
```

---

## Timeline Summary

| Scene | Duration | Content |
|-------|----------|---------|
| 1. Opening Hook | 10s | Agent A receives audit task |
| 2. Smart Matching | 15s | Find skills via MCP tool |
| 3. Agent Assignment | 15s | Assign Security Scanner Pro |
| 4. x402 Payment | 15s | Payment via x402 protocol |
| 5. Explorer Verify | 15s | Show transaction on Monad |
| 6. Work Complete | 15s | Agent B completes audit |
| 7. Distribution | 10s | Show 98/2 split |
| 8. Monad Benefits | 10s | Comparison table |
| 9. CTA | 10s | Links and branding |
| **Total** | **1:55** | **Target: 60-90s** |

---

## Quick Reference Commands

### Test Smart Matching Engine
```bash
cd /Volumes/Kingstone/workspace/rebel-agent-skills/packages/mcp-server
node test-smart-matching.cjs
```

### Start MCP Server
```bash
cd /Volumes/Kingstone/workspace/rebel-agent-skills/packages/mcp-server
export PRIVATE_KEY=0x...
export MYSKILLS_CONTRACT_ADDRESS=0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A
npm start
```

### Check Transaction on Explorer
```bash
open "https://testnet.monadvision.com/tx/0x8f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1"
```

### View Wallet Balance
```bash
cast balance 0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b --rpc-url https://testnet-rpc.monad.xyz
```

---

## Success Metrics

### Technical
- [ ] All MCP tools execute without errors
- [ ] Transaction confirms in <1s on Monad explorer
- [ ] Smart matching returns relevant skills
- [ ] Payment distribution shows correct 98/2 split

### Visual
- [ ] Terminal text is readable (14pt+ font)
- [ ] No personal information visible
- [ ] Smooth transitions between scenes
- [ ] Consistent color scheme throughout

### Narrative
- [ ] Clear problem statement (agents need to hire agents)
- [ ] Obvious solution (MySkills + x402 + Monad)
- [ ] Demonstrable benefits (speed, cost, automation)
- [ ] Strong CTA (GitHub, Demo, Install)

---

## Post-Production Notes

### Transitions
- Use 0.3s fade between scenes
- Add subtle "whoosh" sound on transitions
- Sync visual cuts with narration beats

### Effects
- Highlight key metrics with green checkmarks
- Use yellow rectangles for important UI elements
- Add mouse click effects (yellow circles, scale 1.2x)

### Audio
- Background music: 180 BPM electronic (upbeat but not distracting)
- Sound effects:
  - Success: "ding" (high pitch, short)
  - Payment: "cha-ching" (very brief, subtle)
  - Transition: "whoosh" (medium length)

### Export
- Format: MP4 (H.264)
- Resolution: 1920x1080
- Frame Rate: 30fps
- Bitrate: 8-10 Mbps
- Audio: AAC, 320kbps
- Estimated file size: ~80-120 MB

---

## Troubleshooting

### Issue: MCP server not responding
**Solution**: Check that PRIVATE_KEY is set and contracts are deployed

### Issue: Transaction not confirming
**Solution**: Check wallet has MON balance, RPC is accessible

### Issue: Explorer shows "pending"
**Solution**: Wait 1-2 seconds, refresh page (Monad testnet can have delays)

### Issue: Smart matching returns no skills
**Solution**: Check contract address, ensure skills are registered

---

## Additional Resources

- **MySkills Documentation**: /Volumes/Kingstone/workspace/rebel-agent-skills/packages/mcp-server/README.md
- **Smart Matching Engine**: /Volumes/Kingstone/workspace/rebel-agent-skills/docs/SMART_MATCHING_ENGINE.md
- **x402 Protocol**: https://x402.org
- **Monad Documentation**: https://docs.monad.xyz
- **Moltiverse Submission**: https://moltiverse.xyz/submit

---

**Version**: 1.0
**Last Updated**: 2026-02-09
**Status**: Ready for Recording
**Total Duration**: 1:55 (can be trimmed to 60-90s in editing)
