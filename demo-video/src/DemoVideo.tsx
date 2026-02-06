import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FC } from "react";

// CSS-in-JS styles for the demo
const styles = {
  container: {
    backgroundColor: "#000000",
    fontFamily: "Inter, -apple-system, sans-serif",
  },
  // Animated gradient background
  background: {
    position: "absolute" as const,
    inset: 0,
    background: `
      radial-gradient(circle at 20% 30%, rgba(34, 197, 94, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(34, 211, 238, 0.12) 0%, transparent 50%),
      radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.08) 0%, transparent 60%)
    `,
  },
  grid: {
    position: "absolute" as const,
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
  },
  // Glass card style
  glassCard: {
    background: "rgba(25, 25, 25, 0.7)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "16px",
  },
  // Text colors
  title: {
    fontSize: "56px",
    fontWeight: 700,
    color: "#ffffff",
    letterSpacing: "-0.02em",
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: "18px",
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center" as const,
    lineHeight: 1.6,
  },
  // Badge styles
  badge: {
    display: "inline-block" as const,
    padding: "6px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    fontSize: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    background: "rgba(30, 30, 30, 0.6)",
    color: "rgba(255, 255, 255, 0.8)",
  },
  // Button style
  button: {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: "14px 28px",
    borderRadius: "999px",
    background: "#ffffff",
    color: "#000000",
    fontSize: "15px",
    fontWeight: 500,
    boxShadow: "0 4px 20px rgba(255, 255, 255, 0.2)",
  },
  // Skill card
  skillCard: {
    padding: "24px",
    background: "rgba(25, 25, 25, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "16px",
  },
  platformBadge: {
    padding: "4px 10px",
    borderRadius: "999px",
    fontSize: "10px",
    textTransform: "uppercase" as const,
    background: "rgba(35, 35, 35, 0.7)",
    border: "1px solid rgba(255, 255, 255, 0.25)",
    color: "#ffffff",
  },
};

// Scene 1: Hero
const HeroScene: FC<{ progress: number }> = ({ progress }) => {
  const opacity = interpolate(progress, [0, 0.2], [0, 1]);
  const translateY = interpolate(progress, [0, 1], [50, 0]);
  const scale = spring({
    frame: useCurrentFrame(),
    fps: 30,
    config: { damping: 100, stiffness: 200 },
  });

  return (
    <AbsoluteFill style={styles.container}>
      <div style={styles.background} />
      <div style={styles.grid} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div
          style={{
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            textAlign: "center" as const,
            maxWidth: 900,
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <span style={styles.badge}>Agent Reward Hub</span>
          </div>
          <h1 style={styles.title}>One-click for Creator Rewards</h1>
          <p style={{ ...styles.subtitle, marginTop: 24 }}>
            Cross-platform Agent Skill tipping protocol.
            <br />
            Support Coze, Claude Code, Manus, MiniMax and more.
          </p>
          <div style={{ marginTop: 40, display: "flex", gap: 16, justifyContent: "center" }}>
            <div style={{ ...styles.button, transform: `scale(${1 - progress * 0.1})` }}>
              Discover Skills
            </div>
            <div style={{ ...styles.button, background: "rgba(30, 30, 30, 0.5)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.18)" }}>
              Create Skill
            </div>
          </div>
          <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
            <span style={styles.badge}>Monad Testnet</span>
            <span style={styles.badge}>98% Creator · 2% Burn</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 2: Skills Directory
const SkillsScene: FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const slideIn = spring({ frame, fps: 30, config: { damping: 100 } });
  const opacity = interpolate(progress, [0, 0.3], [0, 1], { extrapolateRight: "clamp" });

  const skills = [
    { name: "Claude Code Copilot", platform: "claude-code", tips: "12.5K" },
    { name: "Coze Bot Builder", platform: "coze", tips: "8.3K" },
    { name: "Manus AI Agent", platform: "manus", tips: "5.1K" },
    { name: "MiniMax Assistant", platform: "minimax", tips: "3.2K" },
  ];

  const cardScale = (index: number) => {
    const delay = index * 10;
    const frame = useCurrentFrame();
    return spring({
      frame: Math.max(0, frame - delay),
      fps: 30,
      config: { damping: 100, stiffness: 150 },
    });
  };

  return (
    <AbsoluteFill style={styles.container}>
      <div style={styles.background} />
      <div style={styles.grid} />
      <AbsoluteFill style={{ padding: 80, justifyContent: "center" }}>
        <div style={{ opacity }}>
          <h2 style={{ fontSize: 32, fontWeight: 600, color: "#ffffff", marginBottom: 40 }}>
            Skills Directory
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {skills.map((skill, index) => {
              const scale = cardScale(index);
              const cardOpacity = interpolate(scale, [0, 1], [0, 1]);
              return (
                <div
                  key={index}
                  style={{
                    ...styles.skillCard,
                    opacity: cardOpacity,
                    transform: `scale(${scale})`,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={styles.platformBadge}>{skill.platform}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>0xabcd...efgh</span>
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 600, color: "#ffffff", marginBottom: 8 }}>
                    {skill.name}
                  </h3>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
                    AI-powered agent skill for automation and productivity
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>💰 {skill.tips} ASKL</span>
                    <div style={{ ...styles.button, padding: "10px 20px", fontSize: 13 }}>
                      Tip 💎
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 3: Leaderboard
const LeaderboardScene: FC<{ progress: number }> = ({ progress }) => {
  const opacity = interpolate(progress, [0, 0.3], [0, 1]);

  const creators = [
    { rank: 1, name: "alice.eth", tips: "45.2K", tier: "Diamond" },
    { rank: 2, name: "bob.dev", tips: "38.7K", tier: "Platinum" },
    { rank: 3, name: "carol.ai", tips: "32.1K", tier: "Gold" },
    { rank: 4, name: "david.web3", tips: "28.4K", tier: "Silver" },
    { rank: 5, name: "eve.build", tips: "24.9K", tier: "Bronze" },
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return `#${rank}`;
  };

  const getTierColor = (tier: string) => {
    const colors = { Diamond: "#b9f2ff", Platinum: "#e5e4e2", Gold: "#ffd700", Silver: "#c0c0c0", Bronze: "#cd7f32" };
    return colors[tier as keyof typeof colors] || "#888";
  };

  const rowSlide = (index: number) => {
    const frame = useCurrentFrame();
    const delay = index * 8;
    return spring({
      frame: Math.max(0, frame - delay),
      fps: 30,
      config: { damping: 100, stiffness: 200 },
    });
  };

  return (
    <AbsoluteFill style={styles.container}>
      <div style={styles.background} />
      <div style={styles.grid} />
      <AbsoluteFill style={{ padding: 80, justifyContent: "center" }}>
        <div style={{ opacity }}>
          <h2 style={{ fontSize: 32, fontWeight: 600, color: "#ffffff", marginBottom: 40 }}>
            🏆 Creator Leaderboard
          </h2>
          <div style={{ ...styles.glassCard, padding: 32 }}>
            {creators.map((creator, index) => {
              const slide = rowSlide(index);
              const translateX = interpolate(slide, [0, 1], [-100, 0]);
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "16px 20px",
                    borderBottom: index < creators.length - 1 ? "1px solid rgba(255,255,255,0.1)" : "none",
                    transform: `translateX(${translateX}px)`,
                  }}
                >
                  <span style={{ fontSize: 24, marginRight: 20, width: 40 }}>{getRankIcon(creator.rank)}</span>
                  <span style={{ flex: 1, fontSize: 16, color: "#ffffff" }}>{creator.name}</span>
                  <span style={{ fontSize: 14, color: getTierColor(creator.tier), marginRight: 20 }}>{creator.tier}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: "#22c55e" }}>💰 {creator.tips}</span>
                </div>
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 4: Skill Detail with Tip
const TipScene: FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const popIn = spring({ frame, fps: 30, config: { damping: 80, stiffness: 200 } });
  const opacity = interpolate(progress, [0, 0.3], [0, 1]);

  // Tip amount animation
  const tipAmount = interpolate(frame, [60, 120], [0, 10], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={styles.container}>
      <div style={styles.background} />
      <div style={styles.grid} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div style={{ opacity, textAlign: "center" as const, maxWidth: 700 }}>
          <div style={{ ...styles.glassCard, padding: 48 }}>
            <span style={styles.badge}>Claude Code</span>
            <h2 style={{ ...styles.title, fontSize: 40, marginTop: 20 }}>Claude Code Copilot</h2>
            <p style={{ ...styles.subtitle, marginTop: 16 }}>
              Advanced AI coding assistant with intelligent code completion
            </p>

            {progress > 0.4 && (
              <div style={{ marginTop: 32 }}>
                <div style={{ ...styles.glassCard, padding: 24, background: "rgba(35, 35, 35, 0.7)" }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 12 }}>Enter tip amount (ASKL)</p>
                  <div style={{ ...styles.button, minWidth: 200 }}>
                    💰 {tipAmount.toFixed(1)} ASKL
                  </div>
                </div>
              </div>
            )}

            {progress > 0.7 && (
              <div style={{ marginTop: 24, padding: 16, background: "rgba(34, 197, 94, 0.2)", borderRadius: "12px", border: "1px solid rgba(34, 197, 94, 0.5)" }}>
                <p style={{ fontSize: 16, color: "#22c55e" }}>✓ Tip submitted successfully!</p>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 8 }}>98% → Creator · 2% → Burn</p>
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 5: Create Skill
const CreateScene: FC<{ progress: number }> = ({ progress }) => {
  const opacity = interpolate(progress, [0, 0.3], [0, 1]);

  const formFields = [
    { label: "Skill Name", value: "My Awesome Agent Skill" },
    { label: "Platform", value: "Claude Code" },
    { label: "Payment Address", value: "0x1234...5678" },
  ];

  const fieldFade = (index: number) => {
    const frame = useCurrentFrame();
    const delay = index * 15;
    return interpolate(Math.max(0, frame - delay), [0, 30], [0, 1], { extrapolateRight: "clamp" });
  };

  return (
    <AbsoluteFill style={styles.container}>
      <div style={styles.background} />
      <div style={styles.grid} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div style={{ opacity, maxWidth: 600 }}>
          <h2 style={{ ...styles.title, fontSize: 36, marginBottom: 32 }}>⚡ Create Your Skill</h2>

          <div style={{ ...styles.glassCard, padding: 32 }}>
            {formFields.map((field, index) => {
              const fieldOpacity = fieldFade(index);
              return (
                <div key={index} style={{ marginBottom: 20, opacity: fieldOpacity }}>
                  <label style={{ display: "block", fontSize: 14, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
                    {field.label} *
                  </label>
                  <div style={{
                    ...styles.glassCard,
                    padding: "12px 16px",
                    background: "rgba(30, 30, 30, 0.6)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    fontSize: 14,
                    color: "#ffffff"
                  }}>
                    {field.value}
                  </div>
                </div>
              );
            })}

            {progress > 0.7 && (
              <div style={{ opacity: interpolate(progress, [0.7, 0.9], [0, 1]), marginTop: 24 }}>
                <div style={{ ...styles.button, width: "100%" }}>
                  Create Skill 🚀
                </div>
                <p style={{ fontSize: 13, color: "#22c55e", textAlign: "center", marginTop: 16 }}>
                  🆓 Get 500 ASKL reward!
                </p>
              </div>
            )}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Scene 6: CLI Tool Demo
const CLIScene: FC<{ progress: number }> = ({ progress }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(progress, [0, 0.2], [0, 1]);

  // Typewriter effect for commands
  const commands = [
    { cmd: "npx myskills list", desc: "List all Skills" },
    { cmd: "npx myskills info <id>", desc: "Get Skill details" },
    { cmd: "npx myskills register \\", desc: "Register new Skill" },
    { cmd: "  --name 'My Skill' \\", desc: "" },
    { cmd: "  --platform claude-code \\", desc: "" },
    { cmd: "  --wallet 0x1234...5678", desc: "" },
  ];

  const typeLine = (index: number) => {
    const delay = index * 20;
    return interpolate(Math.max(0, frame - delay), [0, 40], [0, 1], { extrapolateRight: "clamp" });
  };

  const cursorBlink = Math.floor(frame / 15) % 2 === 0;

  return (
    <AbsoluteFill style={styles.container}>
      <div style={styles.background} />
      <div style={styles.grid} />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 60 }}>
        <div style={{ opacity, maxWidth: 800 }}>
          <h2 style={{ ...styles.title, fontSize: 36, marginBottom: 16 }}>💻 myskills CLI</h2>
          <p style={{ ...styles.subtitle, marginBottom: 32 }}>
            Register and manage your Agent Skills from the command line
          </p>

          <div style={{ ...styles.glassCard, padding: 24, fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', monospace" }}>
            <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 24 }}>$</div>
              <div style={{ flex: 1 }}>
                {commands.map((line, index) => {
                  const width = typeLine(index);
                  if (line.desc) {
                    return (
                      <div key={index} style={{ marginBottom: 12, opacity: width }}>
                        <span style={{ color: "#22c55e" }}>{line.cmd}</span>
                        <span style={{ color: "rgba(255,255,255,0.5)", marginLeft: 12 }}>{line.desc}</span>
                      </div>
                    );
                  }
                  return (
                    <div key={index} style={{ opacity: width, marginLeft: 24 }}>
                      <span style={{ color: "#a78bfa" }}>{line.cmd}</span>
                      {index === commands.length - 1 && width > 0.9 && cursorBlink && (
                        <span style={{ color: "#ffffff" }}>▋</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {progress > 0.7 && (
              <div style={{ opacity: interpolate(progress, [0.7, 0.9], [0, 1]), marginTop: 20 }}>
                <div style={{ padding: 16, background: "rgba(34, 197, 94, 0.2)", borderRadius: "12px", border: "1px solid rgba(34, 197, 94, 0.5)" }}>
                  <p style={{ fontSize: 14, color: "#22c55e" }}>✓ Skill registered successfully!</p>
                </div>
              </div>
            )}
          </div>

          <div style={{ marginTop: 24, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <span style={styles.badge}>npm install -g myskills</span>
            <span style={styles.badge}>Or use npx</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Main Demo Video Component
export const DemoVideo: FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Scene timing (total 1080 frames = 36 seconds at 30fps)
  // Scene 1: 0-180 (6s) - Hero
  // Scene 2: 180-360 (6s) - Skills
  // Scene 3: 360-540 (6s) - Leaderboard
  // Scene 4: 540-720 (6s) - Tip
  // Scene 5: 720-900 (6s) - Create
  // Scene 6: 900-1080 (6s) - CLI

  const sceneDuration = 180;
  const currentScene = Math.floor(frame / sceneDuration);
  const sceneProgress = (frame % sceneDuration) / sceneDuration;

  const scenes = [
    <HeroScene key="hero" progress={sceneProgress} />,
    <SkillsScene key="skills" progress={sceneProgress} />,
    <LeaderboardScene key="leaderboard" progress={sceneProgress} />,
    <TipScene key="tip" progress={sceneProgress} />,
    <CreateScene key="create" progress={sceneProgress} />,
    <CLIScene key="cli" progress={sceneProgress} />,
  ];

  return (
    <AbsoluteFill style={styles.container}>
      <div style={styles.background} />
      <div style={styles.grid} />
      {scenes[currentScene] || scenes[0]}
    </AbsoluteFill>
  );
};
