# Moltiverse Hackathon - Track Analysis

## Overview

- **Prize Pool**: $200K total ($10K per winner, up to 16 winners + $40K liquidity boost)
- **Dates**: Feb 2-15, 2026
- **Judging**: Rolling review - ship early, win early
- **Website**: https://moltiverse.dev

---

## Track Comparison

### 🤖 Agent Track (No Token Required)

**Requirements:**
- Working agent that does something interesting
- Monad integration optional but helps
- Clear demo or documentation

**Best For:**
- Developers without crypto experience
- Projects focused on agent functionality/behavior
- Concept validation and experimentation

**Judging Criteria:**
- ✨ **Weird and creative** - surprise us
- 🛠️ **Actually works** - demos matter more than ideas
- 🚀 **Pushes boundaries** - what can agents do that humans can't?
- 🤝 **Bonus:** A2A coordination, trading, community building

---

### 🪙 Agent + Token Track

**Requirements:**
- Deploy token on nad.fun
- Include token address in submission
- Agent must interact with the token

**Best For:**
- Projects ready to launch with token economics
- Agents that need native token for functionality
- Projects seeking community ownership

**Token Creation Flow:**
1. Upload Image → `POST /agent/token/image`
2. Upload Metadata → `POST /agent/token/metadata`
3. Mine Salt → `POST /agent/salt`
4. Create On-Chain → Call `BondingCurveRouter.create()`

Deploy fee: ~10 MON

---

## MySkills Project Fit Analysis

### Current Status
- ✅ Smart contracts deployed on Monad
- ✅ Frontend with RainbowKit integration
- ✅ CLI tool for interaction
- ✅ Cross-platform support (Coze, Claude Code, Manus)
- ✅ Agent-to-agent payment functionality
- ⚠️ Token ($ASKL) designed but NOT deployed on nad.fun
- ⚠️ Limited agent integration examples

### Track Recommendations

#### Primary Track: 🤖 Agent Track (Recommended)

**Why Agent Track fits better:**

1. **Strong Agent Integration Potential**
   - MySkills is fundamentally an agent coordination protocol
   - Enables agent-to-agent value transfer (core judging criterion)
   - Can demonstrate agents paying agents for skills/services

2. **Demo-Ready**
   - Complete working implementation
   - Clear documentation available
   - Multiple interaction modes (web, CLI, future MCP)

3. **Innovation Points**
   - Cross-platform agent skill registry (unique)
   - Monad's high-performance enables micro-tipping (10,000+ TPS)
   - Composable protocol other agents can build upon

4. **Lower Barrier to Entry**
   - No token deployment required
   - Can focus on agent functionality demo
   - Faster submission timeline

#### Secondary Track: 🪙 Agent + Token (Possible with work)

**What's needed:**
- Deploy $ASKL token on nad.fun
- Integrate token with tipping functionality
- Update contracts to interact with token
- Additional testing and documentation

**Pros:**
- Token economics already designed
- Strong community incentive model
- Could qualify for liquidity boost prize ($40K)

**Cons:**
- Additional development time
- More complex submission
- Token not strictly necessary for core value prop

---

## Key Differentiators by Track

### Agent Track Winners Will Excel At:
- Novel agent behaviors and coordination patterns
- Creative use of Monad's performance (10,000+ TPS)
- Pushing boundaries of what agents can do
- Working demos over polished ideas

### Agent+Token Track Winners Will Excel At:
- Seamless token-agent integration
- Community building through token economics
- Sustainable token models
- Active trading and engagement

---

## What Judges Want (Both Tracks)

From [agents.md](https://moltiverse.dev/agents.md):

> - ✨ **Weird and creative** - surprise us
> - 🛠️ **Actually works** - demos matter more than ideas
> - 🚀 **Pushes boundaries** - what can agents do that humans can't?
> - 🤝 **Bonus:** A2A coordination, trading, community building

---

## Strategic Recommendation

### Submit to Agent Track First

**Rationale:**
1. **Immediate submission possible** - core functionality is complete
2. **Strong alignment with judging criteria** - agent coordination is our core value
3. **Rolling judging advantage** - submit early, get feedback
4. **Lower risk** - no token deployment complexity

### Key Success Factors for Agent Track:

1. **Emphasize Agent Coordination**
   - Demonstrate agents paying agents
   - Show cross-platform skill discovery
   - Highlight composable protocol design

2. **Leverage Monad Performance**
   - Micro-tipping enabled by 10,000+ TPS
   - Sub-second transaction confirmation
   - Near-zero gas fees

3. **Demo-First Approach**
   - Working CLI demo
   - Live frontend
   - Clear documentation

4. **Bonus Points**
   - MCP server for Claude Code agents
   - OpenClaw skill for ClawHub agents
   - Agent leaderboard and social features

### Future: Agent+Token Track Consideration

If Agent Track submission is successful and there's time:
- Deploy $ASKL on nad.fun
- Add token-gated features
- Submit to second track (allowed per FAQ)

---

## Competitive Positioning

### MySkills Advantages:
1. **Cross-platform** - supports Coze, Claude Code, Manus
2. **Complete implementation** - not just a concept
3. **Agent-native design** - built for agents from ground up
4. **Monad-optimized** - leverages high-performance blockchain

### Potential Weaknesses to Address:
1. **Limited live agent examples** - need demo scenarios
2. **Social proof** - no active user base yet
3. **Ecosystem integration** - Moltbook/nad.fun integration planned but not built

---

## Next Steps

1. **Finalize Agent Track Submission**
   - Record demo video of agent tipping flow
   - Update documentation with agent use cases
   - Prepare Devfolio submission

2. **Enhance Agent Integration**
   - Complete MCP server for Claude Code
   - Publish OpenClaw skill
   - Create agent demo scenarios

3. **Monitor Track Trends**
   - Review early winners on Moltbook
   - Adjust positioning if needed
   - Consider token deployment if timing allows

---

## Resources

- **Moltiverse Website**: https://moltiverse.dev
- **Agents Documentation**: https://moltiverse.dev/agents.md
- **Submission**: https://moltiverse.dev
- **Moltbook Community**: https://moltbook.com/m/moltiversehackathon
- **Nad.fun API**: https://api.nadapp.net
- **Monad RPC**: https://rpc.monad.xyz

---

*Last Updated: 2026-02-08*
