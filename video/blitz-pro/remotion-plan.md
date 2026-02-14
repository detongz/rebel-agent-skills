# MySkills Blitz Pro - Remotion Video Production Plan

**Project**: Blitz Pro Direction B Demo Video
**Target Duration**: 2:40 (160 seconds)
**Technology**: Remotion 4.x + React + Framer Motion
**Resolution**: 1920x1080 (16:9)
**Frame Rate**: 30fps

---

## Project Structure

```
video/blitz-pro/
├── package.json
├── remotion.config.ts
├── src/
│   ├── Root.tsx
│   ├── Video.tsx
│   ├── compositions/
│   │   ├── MainVideo.tsx
│   │   ├── HookScene.tsx
│   │   ├── ProblemScene.tsx
│   │   ├── SolutionScene.tsx
│   │   ├── X402DemoScene.tsx
│   │   ├── MCPDemoScene.tsx
│   │   ├── PerformanceScene.tsx
│   │   └── CTAScene.tsx
│   ├── components/
│   │   ├── TypingText.tsx
│   │   ├── CodeBlock.tsx
│   │   ├── StatCard.tsx
│   │   ├── ComparisonChart.tsx
│   │   ├── TransactionFlow.tsx
│   │   ├── Logo.tsx
│   │   ├── Background.tsx
│   │   └── ScreenRecording.tsx
│   ├── assets/
│   │   ├── images/
│   │   │   ├── myskills-logo.png
│   │   │   ├── monad-logo.png
│   │   │   ├── ethereum-logo.png
│   │   │   └── x402-logo.png
│   │   ├── recordings/
│   │   │   ├── claude-mcp-demo.mov
│   │   │   ├── x402-facilitator.mov
│   │   │   ├── terminal-demo.mov
│   │   │   ├── block-explorer.mov
│   │   │   └── ethereum-failed.mov
│   │   ├── audio/
│   │   │   ├── voiceover.mp3
│   │   │   ├── background-music.mp3
│   │   │   └── sfx/
│   │   │       ├── typing.mp3
│   │   │       ├── success.mp3
│   │   │       └── whoosh.mp3
│   │   └── fonts/
│   │       ├── Inter.woff2
│   │       └── JetBrainsMono.woff2
│   └── utils/
│       ├── colors.ts
│       ├── timing.ts
│       └── animations.ts
└── public/
    └── (for static assets)
```

---

## Scene Breakdown

### Scene 1: Hook (0:00-0:10) - 10 seconds

**Component**: `HookScene.tsx`

```typescript
import { AbsoluteFill, Sequence } from "remotion";
import { TypingText } from "../components/TypingText";
import { Background } from "../components/Background";

export const HookScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      <Background type="network" />
      <Sequence from={0} durationInFrames={150}>
        <TypingText
          text="Agents need to pay agents."
          style={{ fontSize: 80, fontWeight: "bold" }}
          delay={30}
        />
      </Sequence>
      <Sequence from={180} durationInFrames={120}>
        <TypingText
          text="But they can't hold credit cards."
          style={{ fontSize: 60, color: "#6366f1" }}
          delay={30}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Key Elements**:
- Typing animation component
- Network background particle effect
- Fade transition to next scene

**Duration**: 300 frames (10 seconds @ 30fps)

---

### Scene 2: Problem - Ethereum Limitations (0:10-0:30) - 20 seconds

**Component**: `ProblemScene.tsx`

```typescript
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate } from "remotion";
import { StatCard } from "../components/StatCard";
import { ComparisonChart } from "../components/ComparisonChart";

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = interpolate(frame, [0, 30], [0.8, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Ethereum Logo */}
      <Sequence from={0} durationInFrames={600}>
        <img src="ethereum-logo.png" style={{ opacity, scale }} />
      </Sequence>

      {/* Stats Appearing */}
      <Sequence from={60} durationInFrames={180}>
        <StatCard
          label="Transactions Per Second"
          value="15"
          color="#ef4444"
          delay={30}
        />
      </Sequence>

      <Sequence from={120} durationInFrames={180}>
        <StatCard
          label="Average Gas Fee"
          value="$50+"
          color="#ef4444"
          delay={30}
        />
      </Sequence>

      <Sequence from={180} durationInFrames={180}>
        <StatCard
          label="Payment Finality"
          value="12+ seconds"
          color="#f59e0b"
          delay={30}
        />
      </Sequence>

      {/* Failed Transaction Overlay */}
      <Sequence from={480} durationInFrames={120}>
        <FailedTransactionNotification />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Key Elements**:
- Animated stat cards with counting numbers
- Failed transaction notification popup
- Timeline showing stacked failures

**Duration**: 600 frames (20 seconds)

---

### Scene 3: Solution - MySkills on Monad (0:30-1:00) - 30 seconds

**Component**: `SolutionScene.tsx`

```typescript
import { AbsoluteFill, Sequence } from "remotion";
import { ComparisonChart } from "../components/ComparisonChart";
import { CodeBlock } from "../components/CodeBlock";
import { PaymentFlowDiagram } from "../components/PaymentFlowDiagram";

export const SolutionScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* MySkills Logo */}
      <Sequence from={0} durationInFrames={300}>
        <Logo variant="myskills" animated />
      </Sequence>

      {/* Comparison Chart */}
      <Sequence from={60} durationInFrames={540}>
        <ComparisonChart
          data={[
            { name: "Ethereum", tps: 15, gas: 50, finality: 12 },
            { name: "Other L2s", tps: 100, gas: 5, finality: 2 },
            { name: "Monad", tps: 10000, gas: 0.001, finality: 1 }
          ]}
          highlightIndex={2}
        />
      </Sequence>

      {/* Payment Flow Diagram */}
      <Sequence from={300} durationInFrames={300}>
        <PaymentFlowDiagram
          steps={[
            { label: "Agent", icon: "robot" },
            { label: "Payment Protocol", icon: "protocol" },
            { label: "Resource Access", icon: "unlock" }
          ]}
        />
      </Sequence>

      {/* Code Snippet */}
      <Sequence from={450} durationInFrames={450}>
        <CodeBlock
          language="typescript"
          code={`const payment = await myskills.pay({
  to: "agent-id",
  amount: "10 MON",
  resource: "/api/analyze"
});
// Confirmed in 0.3s`}
          highlightLines={[1, 2, 3, 4, 5, 7]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Key Elements**:
- Animated comparison chart (bar chart)
- Payment flow diagram with animated arrows
- Syntax-highlighted code snippet
- Logo reveal animation

**Duration**: 900 frames (30 seconds)

---

### Scene 4: x402 Protocol Demo (1:00-1:40) - 40 seconds

**Component**: `X402DemoScene.tsx`

```typescript
import { AbsoluteFill, Sequence } from "remotion";
import { ScreenRecording } from "../components/ScreenRecording";
import { Terminal } from "../components/Terminal";
import { HTTPResponse } from "../components/HTTPResponse";
import { PaymentAnimation } from "../components/PaymentAnimation";

export const X402DemoScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* 4-Panel Layout */}

      {/* Panel 1: Agent Request */}
      <Sequence from={0} durationInFrames={300}>
        <Terminal
          title="Agent Terminal"
          commands={[
            { text: "$ curl -X POST https://api.myskills.xyz/analyze", delay: 0 },
            { text: "  -H 'Agent-ID: agent-123'", delay: 30 },
            { text: "  -d '{\"code\": \"...\"}'", delay: 60 }
          ]}
          position="top-left"
        />
      </Sequence>

      {/* Panel 2: 402 Response */}
      <Sequence from={300} durationInFrames={300}>
        <HTTPResponse
          statusCode={402}
          statusText="Payment Required"
          headers={{
            "Payment-Required": "5 MON",
            "Payment-Address": "0x742d...F73a",
            "Payment-Metadata": "resource-id-456"
          }}
          position="top-right"
        />
      </Sequence>

      {/* Panel 3: Payment Flow */}
      <Sequence from={600} durationInFrames={300}>
        <PaymentAnimation
          from="agent"
          to="facilitator"
          amount="5 MON"
          confirmed={true}
          position="bottom-left"
        />
      </Sequence>

      {/* Panel 4: Content Delivered */}
      <Sequence from={900} durationInFrames={300}>
        <Terminal
          title="Response"
          response={{
            status: 200,
            data: { analysis: "...", transactionHash: "0x8f3a...B2c1" }
          }}
          position="bottom-right"
        />
      </Sequence>

      {/* Facilitator URL Overlay */}
      <Sequence from={1050} durationInFrames={150}>
        <URLBox url="https://x402-facilitator.molandak.org" />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Key Elements**:
- 4-panel animated layout
- Terminal window with typing animation
- HTTP response visualization
- Payment token animation
- URL popup for facilitator

**Duration**: 1200 frames (40 seconds)

---

### Scene 5: MCP Integration Demo (1:40-2:10) - 30 seconds

**Component**: `MCPDemoScene.tsx`

```typescript
import { AbsoluteFill, Sequence } from "remotion";
import { ScreenRecording } from "../components/ScreenRecording";
import { ClaudeChat } from "../components/ClaudeChat";
import { MCPToolCall } from "../components/MCPToolCall";
import { TransactionConfirmation } from "../components/TransactionConfirmation";

export const MCPDemoScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#1a1a2e" }}>
      {/* Claude Desktop Window */}
      <Sequence from={0} durationInFrames={900}>
        <ClaudeChat
          messages={[
            {
              role: "user",
              content: "Tip the Solidity auditor 10 MON",
              timestamp: 0
            },
            {
              role: "assistant",
              content: "I'll send 10 MON to solidity-auditor...",
              timestamp: 60
            }
          ]}
        />
      </Sequence>

      {/* MCP Tool Call Animation */}
      <Sequence from={180} durationInFrames={120}>
        <MCPToolCall
          tool="tip_creator"
          params={{
            creator: "solidity-auditor",
            amount: "10 MON"
          }}
        />
      </Sequence>

      {/* Transaction Confirmation */}
      <Sequence from={360} durationInFrames={180}>
        <TransactionConfirmation
          amount="10 MON"
          fee="0.2 MON"
          received="9.8 MON"
          recipient="solidity-auditor"
        />
      </Sequence>

      {/* Block Explorer Popup */}
      <Sequence from={540} durationInFrames={300}>
        <BlockExplorer
          transactionHash="0x8f3a...B2c1"
          blockNumber="12345678"
          status="confirmed"
          animated={true}
        />
      </Sequence>

      {/* Screen Recording Overlay */}
      <Sequence from={0} durationInFrames={900}>
        <ScreenRecording
          src="assets/recordings/claude-mcp-demo.mov"
          opacity={0.3}
          scale={0.8}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Key Elements**:
- Claude Desktop interface simulation
- MCP tool call visualization
- Transaction confirmation popup
- Block explorer mockup with live updates
- Actual screen recording in background

**Duration**: 900 frames (30 seconds)

---

### Scene 6: Monad Performance (2:10-2:30) - 20 seconds

**Component**: `PerformanceScene.tsx`

```typescript
import { AbsoluteFill, Sequence } from "remotion";
import { BarChart } from "../components/BarChart";
import { TPSCounter } from "../components/TPSCounter";
import { LatencyGauge } from "../components/LatencyGauge";

export const PerformanceScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* TPS Comparison Chart */}
      <Sequence from={0} durationInFrames={600}>
        <BarChart
          data={[
            { name: "Ethereum", value: 15, color: "#ef4444" },
            { name: "Solana", value: 1000, color: "#3b82f6" },
            { name: "Monad", value: 10000, color: "#10b981", highlighted: true }
          ]}
          title="Transactions Per Second"
          scale="logarithmic"
        />
      </Sequence>

      {/* Real-time TPS Counter */}
      <Sequence from={180} durationInFrames={420}>
        <TPSCounter
          current={9847}
          peak={10234}
          average={9500}
        />
      </Sequence>

      {/* Latency Comparison */}
      <Sequence from={360} durationInFrames={240}>
        <LatencyGauge
          metrics={[
            { label: "Time to Finality", value: "<1s", target: 1 },
            { label: "Cost per Transaction", value: "$0.001", target: 0.001 }
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Key Elements**:
- Animated bar chart (logarithmic scale)
- Real-time TPS counter with updating numbers
- Latency gauge/meter
- 666x comparison badge

**Duration**: 600 frames (20 seconds)

---

### Scene 7: CTA (2:30-2:40) - 10 seconds

**Component**: `CTAScene.tsx`

```typescript
import { AbsoluteFill, Sequence } from "remotion";
import { Logo } from "../components/Logo";
import { AnimatedText } from "../components/AnimatedText";
import { CTAButtons } from "../components/CTAButtons";

export const CTAScene: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#0f0f1a" }}>
      {/* Background Particles */}
      <NetworkParticles density="high" />

      {/* MySkills Logo */}
      <Sequence from={0} durationInFrames={300}>
        <Logo variant="myskills" animated={true} size="large" />
      </Sequence>

      {/* Tagline */}
      <Sequence from={60} durationInFrames={240}>
        <AnimatedText
          text="Agent-Native Payment Infrastructure"
          style={{ fontSize: 48, fontWeight: "bold" }}
          animation="fade-in-up"
        />
      </Sequence>

      <Sequence from={120} durationInFrames={180}>
        <AnimatedText
          text="MySkills on Monad"
          style={{ fontSize: 36, color: "#6366f1" }}
          animation="fade-in-up"
        />
      </Sequence>

      {/* CTA Buttons */}
      <Sequence from={180} durationInFrames={120}>
        <CTAButtons
          buttons={[
            { label: "Start Building", url: "github.com/myskills", icon: "github" },
            { label: "Join Community", url: "https://discord.gg/TfzSeSRZ", icon: "discord" }
          ]}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
```

**Key Elements**:
- Logo animation
- Text fade-in effects
- CTA buttons with icons
- Network particle background

**Duration**: 300 frames (10 seconds)

---

## Component Library

### Core Components

#### `TypingText.tsx`
```typescript
interface TypingTextProps {
  text: string;
  style?: React.CSSProperties;
  delay?: number; // frames per character
  cursor?: boolean;
}

// Animated typing effect with optional cursor
```

#### `CodeBlock.tsx`
```typescript
interface CodeBlockProps {
  language: string;
  code: string;
  highlightLines?: number[];
  theme?: "dark" | "light";
}

// Syntax-highlighted code with line numbers
```

#### `StatCard.tsx`
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  color?: string;
  delay?: number;
  icon?: string;
}

// Animated stat card with counting numbers
```

#### `ComparisonChart.tsx`
```typescript
interface ComparisonChartProps {
  data: Array<{
    name: string;
    tps: number;
    gas: number;
    finality: number;
  }>;
  highlightIndex?: number;
}

// Multi-metric comparison visualization
```

#### `TransactionFlow.tsx`
```typescript
interface TransactionFlowProps {
  steps: Array<{
    label: string;
    icon: string;
  }>;
  animated?: boolean;
}

// Animated payment flow diagram
```

#### `ScreenRecording.tsx`
```typescript
interface ScreenRecordingProps {
  src: string;
  startTime?: number;
  opacity?: number;
  scale?: number;
  position?: string;
}

// Video playback component for screen recordings
```

---

## Recording MCP Interactions

### Setup Requirements

1. **Install MySkills MCP Server**:
```bash
npm install -g @myskills/mcp-server
```

2. **Configure Claude Desktop**:
```json
{
  "mcpServers": {
    "myskills": {
      "command": "node",
      "args": ["/path/to/myskills-mcp-server/index.js"],
      "env": {
        "MY_SKILLS_API_KEY": "your-api-key",
        "MONAD_RPC_URL": "https://testnet-rpc.monad.xyz"
      }
    }
  }
}
```

3. **Recording Setup**:
```bash
# Use OBS or QuickTime with these settings:
# - Resolution: 2560x1440 (2K)
# - Frame rate: 60fps
# - Format: MOV (ProRes 422)
# - Audio: System audio + Mic
```

### Scripted MCP Interactions

#### Interaction 1: Tip Creator
```typescript
// In Claude Desktop:
User message: "Tip the Solidity auditor 10 MON"

// Expected MCP tool call:
{
  "name": "tip_creator",
  "arguments": {
    "creator": "solidity-auditor",
    "amount": "10",
    "token": "MON"
  }
}

// Expected response:
{
  "success": true,
  "transactionHash": "0x8f3a...B2c1",
  "amount": "10",
  "fee": "0.2",
  "received": "9.8"
}
```

#### Interaction 2: Query Balance
```typescript
User message: "What's my balance?"

// Expected MCP tool call:
{
  "name": "get_balance",
  "arguments": {}
}

// Expected response:
{
  "balance": "1000.5 MON"
}
```

#### Interaction 3: Recent Transactions
```typescript
User message: "Show my recent transactions"

// Expected MCP tool call:
{
  "name": "get_transactions",
  "arguments": {
    "limit": 5
  }
}

// Expected response:
{
  "transactions": [
    {
      "hash": "0x8f3a...B2c1",
      "type": "tip",
      "amount": "10",
      "timestamp": "2026-02-08T10:30:00Z"
    }
  ]
}
```

### Recording Tips

1. **Prepare Environment**:
   - Clean desktop (hide personal files)
   - Set Claude Desktop to dark mode
   - Increase font size for readability
   - Pre-load all necessary tabs

2. **During Recording**:
   - Speak clearly and slowly
   - Pause after each action (2-3 seconds)
   - Show mouse movements smoothly
   - Use click highlighting (if available)

3. **Post-Processing**:
   - Speed up 1.5x for natural pacing
   - Add zoom on important UI elements
   - Trim excessive pauses
   - Add subtle transitions between segments

---

## File Organization

### Asset Management

```typescript
// src/utils/assets.ts
export const ASSETS = {
  images: {
    myskillsLogo: "/assets/images/myskills-logo.png",
    monadLogo: "/assets/images/monad-logo.png",
    ethereumLogo: "/assets/images/ethereum-logo.png",
    x402Logo: "/assets/images/x402-logo.png"
  },
  recordings: {
    claudeMCP: "/assets/recordings/claude-mcp-demo.mov",
    x402Facilitator: "/assets/recordings/x402-facilitator.mov",
    terminal: "/assets/recordings/terminal-demo.mov",
    blockExplorer: "/assets/recordings/block-explorer.mov",
    ethereumFailed: "/assets/recordings/ethereum-failed.mov"
  },
  audio: {
    voiceover: "/assets/audio/voiceover.mp3",
    backgroundMusic: "/assets/audio/background-music.mp3",
    typing: "/assets/audio/sfx/typing.mp3",
    success: "/assets/audio/sfx/success.mp3",
    whoosh: "/assets/audio/sfx/whoosh.mp3"
  }
};
```

### Color Constants

```typescript
// src/utils/colors.ts
export const COLORS = {
  primary: "#6366f1",    // Indigo
  secondary: "#10b981",  // Emerald
  background: "#0f0f1a", // Deep Navy
  text: "#ffffff",       // White
  accent: "#f59e0b",     // Amber
  error: "#ef4444",      // Red
  success: "#10b981",    // Green
  warning: "#f59e0b"     // Orange
};
```

### Timing Constants

```typescript
// src/utils/timing.ts
export const TIMING = {
  fps: 30,
  scenes: {
    hook: 300,           // 10s
    problem: 600,        // 20s
    solution: 900,       // 30s
    x402Demo: 1200,      // 40s
    mcpDemo: 900,        // 30s
    performance: 600,    // 20s
    cta: 300             // 10s
  },
  transitions: {
    fade: 15,            // 0.5s
    slide: 9,            // 0.3s
    zoom: 9              // 0.3s
  }
};
```

---

## Main Video Composition

```typescript
// src/compositions/MainVideo.tsx
import { AbsoluteFill, Sequence, useAudio } from "remotion";
import { HookScene } from "./HookScene";
import { ProblemScene } from "./ProblemScene";
import { SolutionScene } from "./SolutionScene";
import { X402DemoScene } from "./X402DemoScene";
import { MCPDemoScene } from "./MCPDemoScene";
import { PerformanceScene } from "./PerformanceScene";
import { CTAScene } from "./CTAScene";

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill>
      {/* Background Music */}
      <Audio src={ASSETS.audio.backgroundMusic} volume={0.3} />

      {/* Scene 1: Hook */}
      <Sequence from={0} durationInFrames={300}>
        <HookScene />
      </Sequence>

      {/* Scene 2: Problem */}
      <Sequence from={315} durationInFrames={600}>
        <ProblemScene />
      </Sequence>

      {/* Scene 3: Solution */}
      <Sequence from={930} durationInFrames={900}>
        <SolutionScene />
      </Sequence>

      {/* Scene 4: x402 Demo */}
      <Sequence from={1845} durationInFrames={1200}>
        <X402DemoScene />
      </Sequence>

      {/* Scene 5: MCP Demo */}
      <Sequence from={3060} durationInFrames={900}>
        <MCPDemoScene />
      </Sequence>

      {/* Scene 6: Performance */}
      <Sequence from={3990} durationInFrames={600}>
        <PerformanceScene />
      </Sequence>

      {/* Scene 7: CTA */}
      <Sequence from={4620} durationInFrames={300}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
};

// Total: 4920 frames = 164 seconds = 2:44
```

---

## Remotion Configuration

```typescript
// remotion.config.ts
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

Config.setPreset("youtube-1080p"); // 1920x1080, 30fps

export const remotionConfig = {
  codec: "h264",
  crf: 23,
  audioBitrate: "320k",
  videoBitrate: "8M",
  pixelsPerFrame: 1,
  enforceAudioTrack: true,
  proResProfile: undefined,
};
```

---

## Build & Render Commands

```bash
# Development server
npm start

# Preview video
npm run preview

# Render video (production)
npm run build

# Render specific scene
npx remotion render HookScene out/hook.mp4

# Render with audio
npx remotion render MainVideo out/myskills-demo.mp4 \
  --audio=assets/audio/voiceover.mp3 \
  --overwrite

# Export as GIF (for previews)
npx remotion render MainVideo out/myskills-demo.gif \
  --frames=0-300
```

---

## Export Settings

### Final Video Export

```bash
# High quality MP4
npx remotion render MainVideo out/myskills-blitz-pro.mp4 \
  --codec=h264 \
  --crf=18 \
  --audio-bitrate=320k \
  --video-bitrate=10M \
  --overwrite

# Audio mixing
ffmpeg -i out/myskills-blitz-pro.mp4 \
  -i assets/audio/voiceover.mp3 \
  -filter_complex "[0:a][1:a]amix=inputs=2:duration=first:dropout_transition=2" \
  -c:v copy \
  out/myskills-blitz-pro-final.mp4
```

### Platform-Specific Exports

```bash
# YouTube (best quality)
ffmpeg -i out/myskills-blitz-pro.mp4 \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -c:a aac \
  -b:a 320k \
  out/myskills-youtube.mp4

# Twitter (max 512MB, 2:20 recommended)
ffmpeg -i out/myskills-blitz-pro.mp4 \
  -c:v libx264 \
  -preset medium \
  -crf 23 \
  -vf "scale=1280:720" \
  out/myskills-twitter.mp4
```

---

## Performance Optimization

### Large Video Files
- Compress screen recordings: `ffmpeg -i input.mov -c:v prores_ks -profile:v 3 -qscale:v 9 -c:a pcm_s16le output.mov`
- Use proxy files for editing: `ffmpeg -i input.mov -c:v libx264 -preset veryfast -crf 28 proxy.mp4`

### Smooth Animations
- Use `will-change` CSS property
- Limit number of concurrent animations
- Use transforms instead of position changes
- Pre-render complex animations

### Fast Iteration
- Use `--frames` flag to render specific ranges
- Enable Remotion's hot reload
- Cache expensive computations
- Use `staticFile` for assets

---

## Testing & Quality Assurance

### Scene Duration Check
```typescript
// src/utils/validation.ts
export const validateSceneDurations = () => {
  const scenes = {
    hook: 300 / 30,      // 10s
    problem: 600 / 30,   // 20s
    solution: 900 / 30,  // 30s
    x402Demo: 1200 / 30, // 40s
    mcpDemo: 900 / 30,   // 30s
    performance: 600 / 30, // 20s
    cta: 300 / 30        // 10s
  };

  const total = Object.values(scenes).reduce((a, b) => a + b, 0);
  console.log(`Total duration: ${total}s (${Math.floor(total/60)}:${total%60})`);

  // Target: 2:40 (160s)
  if (total < 150) console.warn("Too short!");
  if (total > 180) console.warn("Too long!");
};
```

### Checklist
- [ ] All scenes render without errors
- [ ] Total duration is 2:40 ±10s
- [ ] Audio sync is correct
- [ ] All screen recordings are visible
- [ ] Code snippets are readable
- [ ] Animations are smooth (30fps)
- [ ] Colors meet accessibility standards
- [ ] Export works for target platforms

---

## Production Timeline

### Week 1: Setup & Assets
- [ ] Set up Remotion project
- [ ] Create base components
- [ ] Gather/create all images
- [ ] Record all screen captures
- [ ] Record voiceover
- [ ] Choose background music

### Week 2: Build & Animate
- [ ] Build all 7 scenes
- [ ] Add animations and transitions
- [ ] Sync audio with visuals
- [ ] Add sound effects
- [ ] Test and refine timing

### Week 3: Polish & Export
- [ ] Color grading
- [ ] Audio mixing
- [ ] Final review
- [ ] Export for submission
- [ ] Create platform-specific versions
- [ ] Submit to Blitz Pro

---

## Notes & Tips

1. **Start Simple**: Build static versions first, add animations later
2. **Use Real Data**: Actual transactions > mock data
3. **Keep It Clean**: Remove unnecessary complexity
4. **Test Early**: Preview frequently, don't wait until final render
5. **Version Control**: Commit after each major scene
6. **Backup Assets**: Keep original screen recordings
7. **Document Decisions**: Note why certain approaches were chosen
8. **Plan B**: Have backup recordings if something fails

---

## Resources

- **Remotion Docs**: https://www.remotion.dev/docs
- **Remotion Gallery**: https://www.remotion.dev/gallery
- **Framer Motion**: https://www.framer.com/motion/
- **Blitz Pro Guidelines**: (add official URL)
- **Monad Docs**: https://docs.monad.xyz
- **x402 Protocol**: https://x402.org

---

**Plan Version**: 1.0
**Last Updated**: 2026-02-08
**Status**: Ready for Implementation
