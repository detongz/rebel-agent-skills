# Feb 15 Moltiverse Submission - Action Plan

**Deadline**: Feb 15, 2025
**Current Status**: 6 days remaining

---

## Critical Path: Demo Video

The demo video is the only remaining blocker. Everything else is deployed and working.

### Option A: Quick Screen Recording (Recommended - 2 hours)

**What you need**: A browser and macOS built-in screen recorder

**Steps**:
```bash
# 1. Open your demo page
open https://myskills2026.ddttupupo.buzz

# 2. Start screen recording
# Press Cmd+Shift+5
# Select "Record Entire Screen"
# Click "Record"

# 3. Follow this flow (60 seconds):
# [0:00-0:10] Show homepage, scroll down
# [0:10-0:20] Type "audit smart contract" in requirement field
# [0:20-0:30] Set budget 50 MON, click "智能匹配"
# [0:30-0:40] Show loading → results appear
# [0:40-0:50] Scroll through skill cards and budget summary
# [0:50-1:00] Scroll to "核心特性" and "工作原理" sections

# 4. Stop recording (Cmd+Shift+5 > Stop)
# Video saved to Desktop
```

**That's it.** The demo page is self-explanatory and shows:
- Smart Matching Engine in action
- NLP analysis (keywords extracted)
- Multi-dimensional scoring (relevance, success, value)
- Budget optimization results
- Professional UI with Chinese text

### Option B: Terminal + API Demo (More technical - 3 hours)

Show both the web UI AND the API working:

```bash
# Terminal 1: Show API response
curl -s -X POST https://myskills2026.ddttupupo.buzz/api/smart-match \
  -H "Content-Type: application/json" \
  -d '{"requirement":"audit smart contract for security","budget":50}' | jq .

# Browser: Show web UI
open https://myskills2026.ddttupupo.buzz
```

Record both side-by-side or sequentially.

---

## Submission Form Data (Prepare these)

**Project Name**: MySkills Protocol - Smart Matching Engine for Agent Economy

**Tagline**: Pay Gas → AI Finds Skills → Optimal Budget Allocation → Agent Collaboration

**Demo URL**: https://myskills2026.ddttupupo.buzz

**GitHub**: https://github.com/detongz/agent-reward-hub

**Description (150 words)**:
```
MySkills Protocol enables AI agents to discover, hire, and pay other agents
on Monad blockchain. Our Smart Matching Engine analyzes requirements using NLP,
scores skills by relevance/success/cost, and solves the budget optimization
problem to recommend optimal agent combinations.

Key innovation: When a user pays gas, the agent intelligently finds and hires
other agents, optimizing budget allocation across multiple specialized agents
working in parallel. This enables autonomous agent economies where agents
coordinate and settle payments automatically.

Built on Monad for <1s confirmations and near-zero gas, making high-frequency
agent-to-agent micro-payments viable for the first time.

Tech Stack: Monad, Model Context Protocol (MCP), Smart Matching Engine,
Budget Optimization (Knapsack Algorithm), x402 Gasless Payments.
```

**Contract Addresses**:
- ASKL Token: `0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A`
- RPC: `https://testnet-rpc.monad.xyz`
- Explorer: `https://testnet.monad.xyz`

---

## Timeline

**Today (Feb 9)**:
- [ ] Record demo video (1 hour)
- [ ] Basic edit trim (10 minutes)
- [ ] Upload to YouTube/Vimeo (5 minutes)

**Tomorrow (Feb 10)**:
- [ ] Fill Moltiverse submission form
- [ ] Double-check all links work
- [ ] Submit (early submission buffer)

**Feb 11-14**: Buffer time for any fixes

**Feb 15**: Final deadline

---

## Video Quick Script (Minimal - Just Screen Actions)

```
0:00 - Open https://myskills2026.ddttupupo.buzz
0:10 - Scroll to show full page
0:20 - Type "audit smart contract for security vulnerabilities"
0:30 - Set budget 50 MON, click "智能匹配"
0:40 - Wait for results, show skill cards
0:50 - Scroll to budget summary
1:00 - Scroll to "核心特性" section
1:10 - End
```

**Total**: ~70 seconds

**No narration needed** - the UI speaks for itself. Add music if desired.

---

## One-Command Recording

```bash
# If you want to record with ffmpeg directly
ffmpeg -f avfoundation -i "0:0" -r 30 -s 1920x1080 \
  -c:v libx264 -preset fast -crf 22 \
  ~/Desktop/myskills-demo-$(date +%Y%m%d).mp4

# Then open the file to check
open ~/Desktop/myskills-demo-*.mp4
```

---

## What Makes This Submission Strong

1. **Working Demo**: Real deployed app, not mockups
2. **Smart Matching Engine**: AI-powered, not just a directory
3. **Budget Optimization**: Solves real problem (knapsack algorithm)
4. **Monad Native**: Uses Monad's performance (<1s confirmation)
5. **Agent Economy**: Hits Moltiverse "Skill Marketplace" idea directly

---

## Minimum Viable Video Checklist

- [ ] Homepage visible with MySkills branding
- [ ] Smart Matching button click
- [ ] Results appear with skill recommendations
- [ ] Budget summary shown
- [ ] Features section scrolled through
- [ ] Duration: 60-90 seconds
- [ ] Resolution: 1080p (or at least 720p)

That's it. The demo page does all the heavy lifting.

---

**You are 1 hour away from submission-ready.**
