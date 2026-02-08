# Remotion Video Production Plan - MySkills Demo
**Moltiverse Direction A Submission** | Technical Implementation Guide

## Project Overview

### Technical Stack
- **Framework**: Remotion 4.0 (React-based video creation)
- **Styling**: Tailwind CSS + Framer Motion for animations
- **3D Elements**: Three.js / React Three Fiber (optional)
- **Code Highlighting**: React Syntax Highlighter
- **Audio**: Howler.js for precise audio syncing
- **Export**: Target MP4 (H.264), 1920x1080, 30fps

### Video Configuration
```javascript
// Video configuration
{
  fps: 30,
  width: 1920,
  height: 1080,
  durationInFrames: 5400, // 3 minutes @ 30fps
  defaultProps: {
    theme: 'dark',
    brandColor: '#6366f1'
  }
}
```

---

## Directory Structure

```
/moltiverse-video/
├── src/
│   ├── Root.jsx                    // Main Remotion root
│   ├── Video.jsx                   // Main video composition
│   ├── compositions/               // Scene compositions
│   │   ├── Scene01Hook.jsx
│   │   ├── Scene02Problem.jsx
│   │   ├── Scene03Solution.jsx
│   │   ├── Scene04BountyPosting.jsx
│   │   ├── Scene05Bidding.jsx
│   │   ├── Scene06Verification.jsx
│   │   ├── Scene07Payment.jsx
│   │   ├── Scene08Dispute.jsx
│   │   ├── Scene09Monad.jsx
│   │   └── Scene10CTA.jsx
│   ├── components/
│   │   ├── common/                // Shared components
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Badge.jsx
│   │   │   ├── Icon.jsx
│   │   │   ├── ProgressBar.jsx
│   │   │   ├── Terminal.jsx
│   │   │   ├── CodeBlock.jsx
│   │   │   └── TransactionFlow.jsx
│   │   ├── animations/            // Animation components
│   │   │   ├── Counter.jsx
│   │   │   ├── SkillGrid.jsx
│   │   │   ├── NetworkGraph.jsx
│   │   │   ├── TokenAnimation.jsx
│   │   │   ├── Typewriter.jsx
│   │   │   └── Confetti.jsx
│   │   ├── layouts/               // Layout components
│   │   │   ├── SplitScreen.jsx
│   │   │   ├── Overlay.jsx
│   │   │   └── Transition.jsx
│   │   └── ui/                    // UI mockup components
│   │       ├── MySkillsInterface.jsx
│   │       ├── BountyCard.jsx
│   │       ├── BidCard.jsx
│   │       ├── VerificationBadge.jsx
│   │       └── WalletBalance.jsx
│   ├── assets/                    // Static assets
│   │   ├── images/
│   │   ├── logos/
│   │   ├── fonts/
│   │   └── audio/
│   ├── data/                      // Scene data
│   │   ├── scenes.js
│   │   ├── bounties.js
│   │   ├── bids.js
│   │   └── transactions.js
│   └── utils/
│       ├── timing.js
│       ├── animations.js
│       └── formatters.js
├── public/                        // Static files
│   ├── fonts/
│   ├── audio/
│   └── images/
├── package.json
├── remotion.config.js
└── README.md
```

---

## Scene Breakdown with Technical Implementation

### Scene 1: Hook (0:00 - 0:10) - 300 frames

```jsx
// compositions/Scene01Hook.jsx
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { SkillGrid } from '../components/animations/SkillGrid';
import { Counter } from '../components/animations/Counter';
import { Typewriter } from '../components/animations/Typewriter';

export const Scene01Hook = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = interpolate(frame, [0, 60], [0.8, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a', opacity, scale }}>
      {/* Skill grid with quality warnings */}
      <SkillGrid
        skillCount={400}
        showWarnings={true}
        warningDelay={90}
      />

      {/* Animated counter */}
      <Counter
        from={0}
        to={400}
        duration={120}
        suffix="+ Skills"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />

      {/* Warning overlay */}
      <Typewriter
        text="0 Quality Control"
        startFrame={180}
        style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '48px',
          color: '#ef4444',
          fontWeight: 'bold'
        }}
      />

      {/* Logo emergence */}
      <LogoAnimation
        startFrame={240}
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '50%',
          transform: 'translateX(-50%)'
        }}
      />
    </AbsoluteFill>
  );
};

Scene01Hook.durationInFrames = 300;
```

### Scene 2: Problem Statement (0:10 - 0:30) - 600 frames

```jsx
// compositions/Scene02Problem.jsx
import { AbsoluteFill, useCurrentFrame, spring } from 'remotion';
import { SplitScreen } from '../components/layouts/SplitScreen';
import { Terminal } from '../components/common/Terminal';
import { Graph } from '../components/animations/Graph';

export const Scene02Problem = () => {
  const frame = useCurrentFrame();

  const terminalLines = [
    { text: '$ agent use skill:trader-v2', delay: 0 },
    { text: 'Error: Skill timeout after 30s', delay: 60, type: 'error' },
    { text: '$ agent use skill:analyzer', delay: 120 },
    { text: 'Error: Malformed response', delay: 180, type: 'error' },
    { text: '$ agent use skill:predictor', delay: 240 },
    { text: 'Error: API key invalid', delay: 300, type: 'error' },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <SplitScreen>
        {/* Left side: Agent struggling */}
        <div style={{ flex: 1 }}>
          <AgentIcon state="confused" />
          <Terminal
            lines={terminalLines}
            startFrame={frame}
          />
        </div>

        {/* Right side: Statistics */}
        <div style={{ flex: 1 }}>
          <Graph
            data={[
              { label: 'Successful', value: 33, color: '#10b981' },
              { label: 'Failed', value: 67, color: '#ef4444' }
            ]}
            type="donut"
            animated={true}
          />

          <StatCard
            title="Time Wasted"
            value="67%"
            subtitle="on broken skills"
            startFrame={300}
          />
        </div>
      </SplitScreen>
    </AbsoluteFill>
  );
};

Scene02Problem.durationInFrames = 600;
```

### Scene 3: Solution Introduction (0:30 - 1:00) - 900 frames

```jsx
// compositions/Scene03Solution.jsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Transition } from '../components/layouts/Transition';
import { TransactionFlow } from '../components/common/TransactionFlow';
import { NetworkGraph } from '../components/animations/NetworkGraph';

export const Scene03Solution = () => {
  const frame = useCurrentFrame();

  const flowSteps = [
    { icon: 'coin', label: 'Post Bounty', color: '#f59e0b' },
    { icon: 'hammer', label: 'Build Skill', color: '#6366f1' },
    { icon: 'check', label: 'Verify', color: '#10b981' },
    { icon: 'arrow', label: 'Payment', color: '#00d4aa' },
  ];

  const badges = [
    'Bounty-based',
    'Verified Quality',
    'Monad-Powered'
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <Transition type="fade-in" duration={30}>
        {/* Clean MySkills interface */}
        <MySkillsInterface
          showBounties={true}
          animated={true}
        />

        {/* Flow diagram */}
        <TransactionFlow
          steps={flowSteps}
          startFrame={60}
          duration={600}
        />

        {/* Feature badges */}
        <div style={{
          position: 'absolute',
          bottom: '15%',
          display: 'flex',
          gap: '20px'
        }}>
          {badges.map((badge, i) => (
            <Badge
              key={badge}
              text={badge}
              startFrame={300 + (i * 60)}
              animated={true}
            />
          ))}
        </div>

        {/* Network visualization */}
        <NetworkGraph
          nodeCount={50}
          animated={true}
          startFrame={450}
        />
      </Transition>
    </AbsoluteFill>
  );
};

Scene03Solution.durationInFrames = 900;
```

### Scene 4: Bounty Posting (1:00 - 1:15) - 450 frames

```jsx
// compositions/Scene04BountyPosting.jsx
import { AbsoluteFill, useCurrentFrame, spring } from 'remotion';
import { MySkillsInterface } from '../components/ui/MySkillsInterface';

export const Scene04BountyPosting = () => {
  const frame = useCurrentFrame();

  // Simulate form filling animation
  const formProgress = spring({
    frame: frame - 30,
    fps: 30,
    config: { damping: 15 }
  });

  const bountyData = {
    title: 'Solidity Security Auditor',
    description: 'Need comprehensive vulnerability detection for ERC-20 tokens',
    bounty: 50,
    currency: 'MON',
    deadline: 7,
    unit: 'days'
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <MySkillsInterface
        mode="post-bounty"
        data={bountyData}
        formProgress={formProgress}
        showCursor={true}
        autoSubmit={true}
        submitDelay={390}
      />
    </AbsoluteFill>
  );
};

Scene04BountyPosting.durationInFrames = 450;
```

### Scene 5: Bidding & Building (1:15 - 1:35) - 600 frames

```jsx
// compositions/Scene05Bidding.jsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { SplitScreen } from '../components/layouts/SplitScreen';
import { BidCard } from '../components/ui/BidCard';

export const Scene05Bidding = () => {
  const frame = useCurrentFrame();

  const bids = [
    {
      builder: '@audit-master',
      reputation: 98,
      amount: 45,
      timeline: 5,
      delay: 60
    },
    {
      builder: '@security-pro',
      reputation: 94,
      amount: 48,
      timeline: 6,
      delay: 120
    },
    {
      builder: '@smart-contract-dev',
      reputation: 89,
      amount: 50,
      timeline: 7,
      delay: 180
    }
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <SplitScreen>
        {/* Left: Bounty detail with bids */}
        <div style={{ flex: 1 }}>
          <BountyDetailCard
            bounty={{
              title: 'Solidity Security Auditor',
              status: 'accepting-bids'
            }}
          />

          {bids.map((bid, i) => (
            <BidCard
              key={i}
              {...bid}
              startFrame={bid.delay}
            />
          ))}

          <Button
            text="Accept Bid"
            startFrame={300}
            onClick={() => {}}
          />
        </div>

        {/* Right: Builder development */}
        <div style={{ flex: 1 }}>
          <Terminal
            title="Builder Terminal - @audit-master"
            lines={[
              { text: '$ git clone myskills/bounty-123', delay: 360 },
              { text: '$ cd bounty-123', delay: 390 },
              { text: '$ npm install', delay: 420 },
              { text: '$ npm test', delay: 480 },
              { text: '✓ All tests passing', delay: 510, type: 'success' },
              { text: '$ git commit -m "Implement auditor"', delay: 540 },
              { text: '$ git push', delay: 570 },
            ]}
          />

          <ProgressBar
            label="Progress"
            value={75}
            startFrame={420}
          />
        </div>
      </SplitScreen>
    </AbsoluteFill>
  );
};

Scene05Bidding.durationInFrames = 600;
```

### Scene 6: Verification (1:35 - 1:55) - 600 frames

```jsx
// compositions/Scene06Verification.jsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { VerificationDashboard } from '../components/ui/VerificationDashboard';

export const Scene06Verification = () => {
  const frame = useCurrentFrame();

  const checks = [
    { name: 'Automated Tests', status: 'passing', duration: 120 },
    { name: 'Security Scan', status: 'passing', duration: 180 },
    { name: 'Performance Bench', status: 'passing', duration: 240 },
    { name: 'Human Review', status: 'pending', duration: 300 }
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <VerificationDashboard
        skillName="Solidity Security Auditor"
        checks={checks}
        startFrame={frame}
        qualityScore={94}
        onComplete={450}
      />

      {/* Success animation */}
      {frame > 450 && (
        <SuccessOverlay
          badge="Verified"
          score="94/100"
          startFrame={480}
        />
      )}
    </AbsoluteFill>
  );
};

Scene06Verification.durationInFrames = 600;
```

### Scene 7: Payment (1:55 - 2:10) - 450 frames

```jsx
// compositions/Scene07Payment.jsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { WalletBalance } from '../components/ui/WalletBalance';
import { TransactionAnimation } from '../components/animations/TransactionAnimation';

export const Scene07Payment = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <SplitScreen>
        {/* Builder wallet */}
        <WalletBalance
          address="0x1234...5678"
          label="Builder (@audit-master)"
          balance={{ before: 120, after: 165, currency: 'MON' }}
          startFrame={60}
        />

        {/* Poster wallet */}
        <WalletBalance
          address="0xabcd...efgh"
          label="Bounty Poster"
          balance={{ before: 50, after: 5, currency: 'MON' }}
          startFrame={60}
        />
      </SplitScreen>

      {/* Transaction animation */}
      <TransactionAnimation
        amount={45}
        from="0xabcd...efgh"
        to="0x1234...5678"
        network="Monad"
        gasUsed={0.0001}
        startFrame={120}
        duration={300}
      />

      {/* Completion notification */}
      {frame > 420 && (
        <Notification
          type="success"
          title="Transaction Complete"
          message="Payment released in 0.8s"
          gas="$0.0002"
        />
      )}
    </AbsoluteFill>
  );
};

Scene07Payment.durationInFrames = 450;
```

### Scene 8: Dispute System (2:10 - 2:30) - 600 frames

```jsx
// compositions/Scene08Dispute.jsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { DisputeInterface } from '../components/ui/DisputeInterface';

export const Scene08Dispute = () => {
  const frame = useCurrentFrame();

  const dispute = {
    bountyId: '456',
    reason: 'Incomplete functionality',
    evidence: [
      { type: 'code', content: 'showFailedTests()' },
      { type: 'log', content: 'Error coverage 42%' }
    ],
    jurors: [
      { id: 1, vote: 'refund-partial' },
      { id: 2, vote: 'refund-partial' },
      { id: 3, vote: 'refund-full' },
      { id: 4, vote: 'refund-partial' },
      { id: 5, vote: 'no-refund' }
    ],
    ruling: 'partial-refund',
    split: { builder: 0.6, poster: 0.4 }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <DisputeInterface
        dispute={dispute}
        currentFrame={frame}
        showPhase={frame < 300 ? 'evidence' : 'voting'}
      />

      {/* Ruling animation */}
      {frame > 420 && (
        <RulingOverlay
          ruling="Partial Refund"
          split={dispute.split}
          startFrame={450}
        />
      )}
    </AbsoluteFill>
  );
};

Scene08Dispute.durationInFrames = 600;
```

### Scene 9: Monad Integration (2:30 - 2:45) - 450 frames

```jsx
// compositions/Scene09Monad.jsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { ComparisonRace } from '../components/animations/ComparisonRace';

export const Scene09Monad = () => {
  const frame = useCurrentFrame();

  const networks = [
    {
      name: 'Ethereum',
      tps: 15,
      finality: 12,
      gas: 5,
      color: '#627eea'
    },
    {
      name: 'Monad',
      tps: 10000,
      finality: 0.8,
      gas: 0.0002,
      color: '#00d4aa',
      winner: true
    }
  ];

  const features = [
    { icon: 'bolt', label: '10,000 TPS' },
    { icon: 'parallel', label: 'Parallel Execution' },
    { icon: 'clock', label: 'Sub-second Finality' },
    { icon: 'check', label: 'EVM Compatible' }
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <ComparisonRace
        competitors={networks}
        metric="Transaction Speed"
        startFrame={30}
      />

      {/* Feature list */}
      <div style={{
        position: 'absolute',
        bottom: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px'
      }}>
        {features.map((feature, i) => (
          <FeatureCard
            key={i}
            {...feature}
            startFrame={180 + (i * 30)}
          />
        ))}
      </div>

      {/* Logo merge */}
      <LogoMerge
        logos={['myskills', 'monad']}
        startFrame={330}
      />
    </AbsoluteFill>
  );
};

Scene09Monad.durationInFrames = 450;
```

### Scene 10: Call to Action (2:45 - 3:00) - 450 frames

```jsx
// compositions/Scene10CTA.jsx
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { Confetti } from '../components/animations/Confetti';

export const Scene10CTA = () => {
  const frame = useCurrentFrame();

  const messages = [
    'Post bounties',
    'Build skills',
    'Earn rewards',
    'Grow the ecosystem'
  ];

  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = interpolate(frame, [0, 60], [0.9, 1], { extrapolateRight: 'clamp' });

  return (
    <AbsoluteFill style={{
      backgroundColor: '#0f172a',
      opacity,
      scale
    }}>
      {/* Montage of previous scenes */}
      <Montage
        scenes={[1, 3, 5, 7, 9]}
        duration={3} // seconds per scene
        startFrame={30}
      />

      {/* Message sequence */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        {messages.map((msg, i) => (
          <CTAMessage
            key={msg}
            text={msg}
            startFrame={180 + (i * 45)}
          />
        ))}
      </div>

      {/* Network growth visualization */}
      <NetworkGrowth
        nodes={100}
        connections={500}
        startFrame={240}
      />

      {/* Final CTA */}
      <div style={{
        position: 'absolute',
        bottom: '25%',
        left: '50%',
        transform: 'translateX(-50%)',
        textAlign: 'center'
      }}>
        <Logo size="large" />
        <h1 style={{
          fontSize: '48px',
          color: '#ffffff',
          marginTop: '20px'
        }}>
          MySkills on Monad
        </h1>
        <p style={{
          fontSize: '24px',
          color: '#6366f1',
          marginTop: '10px'
        }}>
          The marketplace that powers agents
        </p>
        <div style={{
          marginTop: '30px',
          fontSize: '20px',
          color: '#94a3b8'
        }}>
          myskills.monad
        </div>
      </div>

      {/* Confetti celebration */}
      {frame > 360 && <Confetti />}
    </AbsoluteFill>
  );
};

Scene10CTA.durationInFrames = 450;
```

---

## Shared Components

### Common Components

```jsx
// components/common/Button.jsx
export const Button = ({
  text,
  onClick,
  variant = 'primary',
  startFrame = 0,
  style = {}
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 15],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  const variants = {
    primary: { bg: '#6366f1', color: '#ffffff' },
    secondary: { bg: '#1e293b', color: '#ffffff' },
    success: { bg: '#10b981', color: '#ffffff' },
    danger: { bg: '#ef4444', color: '#ffffff' }
  };

  return (
    <button
      onClick={onClick}
      style={{
        ...styles.button,
        backgroundColor: variants[variant].bg,
        color: variants[variant].color,
        opacity,
        ...style
      }}
    >
      {text}
    </button>
  );
};

// components/common/Card.jsx
export const Card = ({
  children,
  title,
  icon,
  startFrame = 0,
  style = {}
}) => {
  const frame = useCurrentFrame();
  const translateY = interpolate(
    frame,
    [startFrame, startFrame + 30],
    [20, 0],
    { extrapolateRight: 'clamp' }
  );
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 30],
    [0, 1],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div style={{
      ...styles.card,
      transform: `translateY(${translateY}px)`,
      opacity,
      ...style
    }}>
      {title && (
        <div style={styles.cardHeader}>
          {icon && <Icon name={icon} />}
          <h3>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

// components/common/Badge.jsx
export const Badge = ({
  text,
  variant = 'default',
  startFrame = 0
}) => {
  const frame = useCurrentFrame();
  const scale = spring({
    frame: frame - startFrame,
    fps: 30,
    config: { damping: 10 }
  });

  const variants = {
    default: { bg: '#6366f1', color: '#ffffff' },
    success: { bg: '#10b981', color: '#ffffff' },
    warning: { bg: '#f59e0b', color: '#ffffff' },
    danger: { bg: '#ef4444', color: '#ffffff' }
  };

  return (
    <div style={{
      ...styles.badge,
      backgroundColor: variants[variant].bg,
      color: variants[variant].color,
      transform: `scale(${scale})`,
      opacity: scale
    }}>
      {text}
    </div>
  );
};
```

### Animation Components

```jsx
// components/animations/Counter.jsx
export const Counter = ({
  from,
  to,
  duration,
  suffix = '',
  style = {}
}) => {
  const frame = useCurrentFrame();
  const value = interpolate(
    frame,
    [0, duration],
    [from, to],
    { extrapolateRight: 'clamp' }
  );

  return (
    <div style={{ ...styles.counter, ...style }}>
      {Math.floor(value).toLocaleString()}{suffix}
    </div>
  );
};

// components/animations/SkillGrid.jsx
export const SkillGrid = ({
  skillCount,
  showWarnings = false,
  warningDelay = 0
}) => {
  const frame = useCurrentFrame();
  const skills = Array.from({ length: skillCount }, (_, i) => ({
    id: i,
    hasWarning: showWarnings && Math.random() > 0.7
  }));

  return (
    <div style={styles.grid}>
      {skills.map((skill, i) => (
        <SkillIcon
          key={skill.id}
          {...skill}
          delay={i * 2}
          warningDelay={showWarnings ? warningDelay + (i * 3) : null}
        />
      ))}
    </div>
  );
};

// components/animations/Typewriter.jsx
export const Typewriter = ({
  text,
  startFrame = 0,
  speed = 2,
  style = {}
}) => {
  const frame = useCurrentFrame();
  const progress = Math.floor((frame - startFrame) / speed);
  const visibleText = text.slice(0, Math.max(0, progress));
  const showCursor = (frame - startFrame) % 20 < 10;

  return (
    <div style={{ ...styles.typewriter, ...style }}>
      {visibleText}
      {showCursor && <span>|</span>}
    </div>
  );
};

// components/animations/TransactionFlow.jsx
export const TransactionFlow = ({
  steps,
  startFrame,
  duration
}) => {
  const frame = useCurrentFrame();
  const progress = (frame - startFrame) / duration;

  return (
    <div style={styles.flow}>
      {steps.map((step, i) => {
        const stepProgress = Math.max(0, Math.min(1,
          (progress - (i / steps.length)) * steps.length
        ));

        return (
          <FlowStep
            key={i}
            {...step}
            progress={stepProgress}
            delay={startFrame + (i * (duration / steps.length))}
          />
        );
      })}

      {/* Connection lines */}
      <svg style={styles.flowLines}>
        {steps.map((_, i) => (
          <FlowLine
            key={i}
            index={i}
            total={steps.length}
            progress={progress}
          />
        ))}
      </svg>
    </div>
  );
};
```

### UI Components

```jsx
// components/ui/Terminal.jsx
export const Terminal = ({
  title = 'Terminal',
  lines = [],
  startFrame = 0
}) => {
  const frame = useCurrentFrame();

  return (
    <div style={styles.terminal}>
      <div style={styles.terminalHeader}>
        <div style={styles.terminalButtons}>
          <span style={{ background: '#ef4444' }} />
          <span style={{ background: '#f59e0b' }} />
          <span style={{ background: '#10b981' }} />
        </div>
        <span style={styles.terminalTitle}>{title}</span>
      </div>
      <div style={styles.terminalBody}>
        {lines.map((line, i) => {
          const lineFrame = frame - startFrame - line.delay;
          const visible = lineFrame >= 0;

          if (!visible) return null;

          return (
            <TerminalLine
              key={i}
              {...line}
              delay={line.delay}
            />
          );
        })}
      </div>
    </div>
  );
};

// components/ui/CodeBlock.jsx
export const CodeBlock = ({
  code,
  language = 'javascript',
  startFrame = 0,
  highlightedLines = []
}) => {
  const frame = useCurrentFrame();
  const lines = code.split('\n');

  return (
    <div style={styles.codeBlock}>
      {lines.map((line, i) => {
        const lineFrame = frame - startFrame - (i * 5);
        const visible = lineFrame >= 0;
        const highlighted = highlightedLines.includes(i + 1);

        return (
          <div
            key={i}
            style={{
              ...styles.codeLine,
              opacity: visible ? 1 : 0,
              backgroundColor: highlighted ? '#6366f133' : 'transparent'
            }}
          >
            <span style={styles.lineNumber}>{i + 1}</span>
            <span style={styles.codeContent}>{line}</span>
          </div>
        );
      })}
    </div>
  );
};
```

---

## Data Files

```javascript
// data/scenes.js
export const scenes = [
  {
    id: 1,
    title: 'Hook',
    duration: 300,
    component: 'Scene01Hook'
  },
  {
    id: 2,
    title: 'Problem Statement',
    duration: 600,
    component: 'Scene02Problem'
  },
  // ... all scenes
];

// data/bounties.js
export const sampleBounties = [
  {
    id: '123',
    title: 'Solidity Security Auditor',
    description: 'Need comprehensive vulnerability detection',
    amount: 50,
    currency: 'MON',
    deadline: 7,
    status: 'open',
    poster: '@agent-trader'
  },
  // ... more bounties
];

// data/bids.js
export const sampleBids = [
  {
    id: 'bid-1',
    bountyId: '123',
    bidder: '@audit-master',
    amount: 45,
    timeline: 5,
    reputation: 98,
    completed: 47
  },
  // ... more bids
];
```

---

## Utility Functions

```javascript
// utils/timing.js
export const framesToSeconds = (frames, fps = 30) => frames / fps;
export const secondsToFrames = (seconds, fps = 30) => seconds * fps;

export const delayFrames = (frames, delay) =>
  Math.max(0, frames - delay);

// utils/animations.js
export const easeInOut = (t) =>
  t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

export const spring = (t, stiffness = 0.5, damping = 0.75) => {
  // Simplified spring physics
  return 1 - Math.exp(-stiffness * t) * Math.cos(damping * t);
};

// utils/formatters.js
export const formatCurrency = (amount, currency = 'MON') =>
  `${amount.toLocaleString()} ${currency}`;

export const formatAddress = (address) =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

export const formatDuration = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};
```

---

## Main Composition

```jsx
// Video.jsx
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';
import { Scene01Hook } from './compositions/Scene01Hook';
import { Scene02Problem } from './compositions/Scene02Problem';
// ... import all scenes

export const Video = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#0f172a' }}>
      <Sequence from={0} durationInFrames={300}>
        <Scene01Hook />
      </Sequence>

      <Sequence from={300} durationInFrames={600}>
        <Scene02Problem />
      </Sequence>

      <Sequence from={900} durationInFrames={900}>
        <Scene03Solution />
      </Sequence>

      <Sequence from={1800} durationInFrames={450}>
        <Scene04BountyPosting />
      </Sequence>

      <Sequence from={2250} durationInFrames={600}>
        <Scene05Bidding />
      </Sequence>

      <Sequence from={2850} durationInFrames={600}>
        <Scene06Verification />
      </Sequence>

      <Sequence from={3450} durationInFrames={450}>
        <Scene07Payment />
      </Sequence>

      <Sequence from={3900} durationInFrames={600}>
        <Scene08Dispute />
      </Sequence>

      <Sequence from={4500} durationInFrames={450}>
        <Scene09Monad />
      </Sequence>

      <Sequence from={4950} durationInFrames={450}>
        <Scene10CTA />
      </Sequence>
    </AbsoluteFill>
  );
};
```

---

## Configuration

```javascript
// remotion.config.js
import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);

// Puppeteer configuration for rendering
Config.setChromiumOpenGlRenderer('egl');
Config.setChromiumDisableWebSecurity(true);

// Output settings
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');

// Audio settings
Config.setAudioCodec('aac');
Config.setAudioBitrate('320k');
```

```javascript
// Root.jsx
import { Composition } from 'remotion';
import { Video } from './Video';

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="MySkillsDemo"
        component={Video}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          theme: 'dark',
          brandColor: '#6366f1'
        }}
      />
    </>
  );
};
```

---

## Build & Render Commands

```bash
# Development
npm start

# Preview
npm run preview

# Render video (high quality)
npx remotion render MySkillsDemo output.mp4 \
  --codec=h264 \
  --pixel-format=yuv420p \
  --audio-bitrate=320k \
  --video-bitrate=20M \
  --prores-profile=422 \
  --frames=0-5400

# Render with progress
npx remotion render MySkillsDemo output.mp4 \
  --progress=true \
  --overwrite=true

# Render specific scene
npx remotion render MySkillsDemo scene-01.mp4 \
  --frames=0-300

# Bundle for review
npm run build
```

---

## Audio Integration

```javascript
// utils/audio.js
import { useAudio } from './hooks/useAudio';

export const useSceneAudio = (sceneId) => {
  const audioTracks = {
    'scene-1': '/audio/hook-tension.mp3',
    'scene-2': '/audio/problem-underscore.mp3',
    'scene-3': '/audio/solution-upbeat.mp3',
    // ... all scenes
  };

  return {
    src: audioTracks[sceneId],
    // Audio settings per scene
    volume: 0.8,
    fadeIn: 0.5,
    fadeOut: 0.3
  };
};

// Hook for audio synchronization
export const useAudioSync = (audioFile) => {
  const { duration } = useAudio();

  // Return frame markers for audio beats
  return {
    beats: [], // Calculated from audio analysis
    dropPoints: [] // Key moments for visual emphasis
  };
};
```

---

## Performance Optimization

```javascript
// utils/performance.js
export const optimizeRendering = (config) => {
  return {
    // Use fewer frames for preview
    previewFrameRate: 15,

    // Render in chunks for long videos
    chunkSize: 1000,

    // Cache heavy computations
    memoizeComponents: true,

    // Lazy load assets
    lazyLoadImages: true,

    // Reduce quality for preview
    previewQuality: 'medium',
    renderQuality: 'high'
  };
};
```

---

## Testing & Quality Assurance

```javascript
// tests/compositions.test.js
import { render } from '@testing-library/react';
import { Scene01Hook } from '../compositions/Scene01Hook';

describe('Video Compositions', () => {
  test('Scene 01 renders correctly', () => {
    const { container } = render(<Scene01Hook />);
    expect(container).toMatchSnapshot();
  });

  test('Scene durations sum correctly', () => {
    const totalDuration = scenes.reduce((sum, scene) =>
      sum + scene.duration, 0
    );
    expect(totalDuration).toBe(5400); // 3 minutes @ 30fps
  });
});
```

---

## Export Checklist

- [ ] All scenes rendered successfully
- [ ] Audio synced and balanced
- [ ] No frame drops or stuttering
- [ ] Colors calibrated (sRGB)
- [ ] Audio levels normalized (-16 LUFS)
- [ ] File size optimized (<500MB)
- [ ] Test playback on multiple players
- [ ] Subtitle/caption file generated
- [ ] Thumbnail created
- [ ] Metadata populated

---

**Document Version**: 1.0
**Last Updated**: 2025-02-08
**Remotion Version**: 4.0.x
**Node Version**: 18.x or higher
**Estimated Render Time**: 45-90 minutes (M1/M2 Mac), 2-3 hours (Intel)