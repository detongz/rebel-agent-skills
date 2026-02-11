# OpenClaw Plugin Distribution Research

**Date:** 2026-02-11
**Purpose:** MySkills Protocol plugin distribution strategy for Moltiverse hackathon

## Problem Statement

Current installation method requires cloning the entire repository:
```bash
git clone https://github.com/your-org/rebel-agent-skills.git
cd rebel-agent-skills
openclaw plugins install ./openclaw
```

This is not user-friendly and creates friction for adoption.

---

## Distribution Options Comparison

### Option 1: ClawHub (Recommended) ⭐

**What is ClawHub?**
- Official skill registry for OpenClaw/Clawdbot
- Website: https://clawhub.ai
- Centralized marketplace for AI agent skills

**Installation:**
```bash
npx clawhub@latest install myskills
```

**Publishing:**
```bash
clawhub publish
```

**Pros:**
- Official registry - users trust it
- Built-in skill discovery and search
- Automatic updates and versioning
- Security scanning (post-ClawHavoc improvements)
- Integrated with OpenClaw ecosystem

**Cons:**
- Requires ClawHub account
- Approval process may be required
- Dependency on third-party platform
- ClawHavoc incident (Feb 2026) - 341 malicious skills were distributed

**Effort:** Medium - need to register and configure

---

### Option 2: npm Publishing

**Installation:**
```bash
npm install -g @myskills/openclaw
# or
npx @myskills/openclaw
```

**Publishing:**
```bash
cd openclaw
npm publish
```

**Pros:**
- Standard Node.js distribution method
- Users already familiar with npm
- Version management built-in
- No platform dependency
- Can use scoped package (@myskills)

**Cons:**
- Not discoverable in ClawHub marketplace
- Requires npm account and access to @myskills scope
- Global install may conflict with other tools
- Not integrated with OpenClaw's plugin system

**Effort:** Low - package.json already configured

**Current State:**
- `openclaw/package.json` already has `@myskills/openclaw` v1.0.0
- Build output at `dist/index.js`
- Ready to publish with `npm publish`

---

### Option 3: GitHub Releases + npx

**Installation:**
```bash
npx @myskills/openclaw@latest
```

**Setup:**
- Publish as npm package but host source on GitHub
- Use GitHub releases for versioning

**Pros:**
- Source code transparency
- GitHub already hosts the repo
- Star-based social proof
- Issue tracking integrated

**Cons:**
- Still requires npm publish
- No ClawHub marketplace visibility
- Manual update management

**Effort:** Low - combines npm + GitHub

---

### Option 4: Direct URL Install

**Installation:**
```bash
openclaw plugins install https://github.com/your-org/rebel-agent-skills/raw/main/openclaw/package.json
```

**Pros:**
- No registry required
- Always uses latest version
- Simple one-time setup

**Cons:**
- Not an official OpenClaw feature (may not work)
- No version control
- Network dependency
- Less secure (no checksum verification)

**Effort:** Very Low - but unreliable

---

## Recommended Strategy: Hybrid Approach 🎯

### Phase 1: Immediate (Pre-Hackathon)

**Publish to npm** - Fastest path to user-friendly install:

```bash
# 1. Build the plugin
cd openclaw
npm run build

# 2. Publish to npm
npm publish --access public
```

**User Installation:**
```bash
# Option A: Direct npx (no install needed)
npx @myskills/openclaw

# Option B: Install globally
npm install -g @myskills/openclaw

# Option C: Add to OpenClaw manually
openclaw plugins install @myskills/openclaw
```

### Phase 2: Post-Hackathon

**Submit to ClawHub** - For ecosystem discovery:

1. Create ClawHub account at https://clawhub.ai
2. Link GitHub repository
3. Configure skill metadata
4. Submit for review
5. Publish with `clawhub publish`

**User Installation:**
```bash
npx clawhub@latest install myskills
```

---

## Security Considerations

### ClawHavoc Incident (Feb 2026)

**What happened:**
- 341 malicious skills were distributed through ClawHub
- Skills contained hidden malicious code
- Trust in the ecosystem was damaged

**Impact on MySkills:**
1. **Transparency is key** - Open source everything
2. **Use verified GitHub** - Link repo to prove authenticity
3. **Provide checksums** - Allow verification of downloads
4. **Community trust** - Get early reviewers/stars on GitHub

### Best Practices for Trust

1. **Code signing** - Sign your npm packages
2. **Security audit** - Run `npm audit` before publishing
3. **License clarity** - MIT or Apache 2.0
4. **Documentation** - Clear README and security policy
5. **Contact info** - Responsive to issues

---

## Updated Demo Page Recommendations

The current demo page (`frontend/app/demo/agent-workflow/page.tsx`) shows:

```typescript
// Current (misleading - packages don't exist):
openclaw plugins install @myskills/solidity-auditor
npx @myskills/gas-optimizer
```

**Should be updated to:**

```typescript
// After npm publish:
npm install -g @myskills/openclaw
npx @myskills/openclaw

// After ClawHub submission:
npx clawhub@latest install myskills
```

---

## Implementation Checklist

### Immediate Actions (Today)

- [ ] Verify `openclaw/` build output is ready
- [ ] Create npm account (if not exists)
- [ ] Claim/create `@myskills` organization on npm
- [ ] Run `npm publish` in `openclaw/` directory
- [ ] Test installation in fresh environment
- [ ] Update demo page with correct install commands
- [ ] Add installation section to main README

### Post-Hackathon Actions

- [ ] Create ClawHub account
- [ ] Submit skill to ClawHub marketplace
- [ ] Add ClawHub install badge to README
- [ ] Create installation video tutorial
- [ ] Set up GitHub releases

---

## User Experience Flow

### Before (Current)
```bash
# Too many steps, high friction
git clone https://github.com/your-org/rebel-agent-skills.git
cd rebel-agent-skills
npm install
cd openclaw
npm run build
cd ..
openclaw plugins install ./openclaw
```

### After (Recommended)
```bash
# One command, zero friction
npx @myskills/openclaw
```

---

## Cost Analysis

| Option | Time Cost | Money Cost | Maintenance |
|--------|-----------|------------|-------------|
| Clone repo | High (user) | Free | Manual updates |
| npm publish | Low (1x) | Free (~$7/org if reserved) | Low |
| ClawHub | Medium | Free | Medium |
| Hybrid | Low+Medium | ~$7 one-time | Low |

---

## Conclusion

**For hackathon demo (Feb 15):**
1. Publish to npm as `@myskills/openclaw`
2. Update demo with `npx @myskills/openclaw`
3. Add to main README

**For long-term adoption:**
1. Submit to ClawHub for marketplace visibility
2. Maintain both npm and ClawHub distribution
3. Leverage community trust through transparency

The hybrid approach gives you immediate usability through npm while positioning for ecosystem integration through ClawHub.
