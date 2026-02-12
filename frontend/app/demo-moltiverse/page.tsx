"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseAbi, formatUnits } from "viem";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// Category icons mapping
const CATEGORY_ICONS: Record<string, string> = {
  'security': '🛡️',
  'Security': '🛡️',
  'defi': '💰',
  'DeFi': '💰',
  'development': '👨‍💻',
  'Development': '👨‍💻',
  'analytics': '📊',
  'Analytics': '📊',
  'data': '🔌',
  'Data': '🔌',
  'optimization': '⚡',
  'Optimization': '⚡',
  'education': '📚',
  'Education': '📚',
  'trading': '📈',
  'Trading': '📈',
  'audit': '🔍',
  'Audit': '🔍',
  'all': '📦',
};

// Helper function to get category icon
function getCategoryIcon(category: string): string {
  return CATEGORY_ICONS[category] || '📦';
}

// Type definition for API response
interface Skill {
  id: string;
  skill_id: string;
  name: string;
  description: string;
  platform: string;
  creator_address: string;
  payment_address: string;
  repository: string;
  homepage: string;
  category: string;
  security_score: number;
  total_tips: string;
  tip_count: number;
  platform_likes: number;
  download_count: number;
  github_stars: number;
  github_forks: number;
  logo_url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  verified: boolean;
}
import Link from "next/link";

// Contract ABI (simplified for demo)
const ASKL_TOKEN_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function tipSkill(bytes32 skillId, uint256 amount) external",
  "function skillCreators(bytes32) view returns (address)",
  "event Tipped(bytes32 indexed skillId, address indexed tipper, address indexed creator, uint256 amount)",
]);

// Load realistic seed skills
const DEMO_SKILLS = getSeedSkills().slice(0, 6).map(skill => ({
  id: skill.skill_id,
  name: skill.name,
  description: skill.description,
  platform: skill.platform,
  creator: skill.creator,
  totalTips: parseFloat(skill.total_tips) / 1e18,
  totalStars: skill.stars,
  image: skill.categoryIcon || '📦',
  category: skill.category,
  security: skill.security,
  pricing: skill.pricing,
  npmPackage: skill.npm_package,
}));

const CONTRACT_ADDRESS = "0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A" as `0x${string}`;

export default function DemoPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Skills API integration
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  // Fetch real skills from API on component mount
  useEffect(() => {
    const fetchSkills = async () => {
      setSkillsLoading(true);
      setSkillsError(null);
      try {
        const response = await fetch('/api/skills?limit=12&sort=tips');
        const data = await response.json();
        if (data.success) {
          setSkills(data.data);
        } else {
          setSkillsError(data.error || 'Failed to fetch skills');
        }
      } catch (error) {
        setSkillsError(error instanceof Error ? error.message : 'Network error');
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [tipAmount, setTipAmount] = useState(50);
  const [tipping, setTipping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash,
  });

  // Read contract for demo
  const { data: totalSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: ASKL_TOKEN_ABI,
    functionName: "totalSupply",
  });

  const handleTip = async () => {
    if (!selectedSkill) {
      console.error('No skill selected');
      return;
    }
    setTipping(true);
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: ASKL_TOKEN_ABI,
        functionName: "tipSkill",
        args: [selectedSkill.skill_id as `0x${string}`, BigInt(tipAmount * 1e18)],
      });
    } catch (error) {
      console.error("Tip failed:", error);
      setTipping(false);
    }
  };

  // Show success animation after confirmation
  useEffect(() => {
    if (!isConfirming && hash && !isPending) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setTipping(false);
    }
  }, [isConfirming, hash, isPending]);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />

      <Navbar />

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">MOLTIVERSE_AGENT_TRACK_v1.0</span>
            <h1 className="hero-title">
              <span>AGENT-TO-AGENT</span> <span>PAYMENTS</span>
            </h1>
            <p className="hero-subtitle">
              Enable AI agents to discover, hire, and pay each other on Monad blockchain
            </p>
          </div>
        </section>

        {/* Stats */}
        <div className="max-w-4xl mx-auto px-6 mb-12">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card text-center">
              <div className="text-3xl font-bold text-[var(--neon-purple)] font-['Orbitron']">10,000+</div>
              <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">TPS on Monad</div>
            </div>
            <div className="glass-card text-center">
              <div className="text-3xl font-bold text-[var(--neon-blue)] font-['Orbitron']">&lt; 1s</div>
              <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Finality Time</div>
            </div>
            <div className="glass-card text-center">
              <div className="text-3xl font-bold text-[var(--neon-green)] font-['Orbitron']">~$0.001</div>
              <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Per Transaction</div>
            </div>
          </div>
        </div>

        {/* OpenClaw Installation Section */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <div className="glass-card border-2 border-[var(--neon-green)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="text-4xl">🤖</div>
              <div>
                <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-green)] mb-2">
                  ENABLE AGENT-TO-AGENT PAYMENTS
                </h2>
                <p className="text-[var(--text-muted)] font-['Rajdhani']">
                  Install the MySkills plugin for OpenClaw to enable your agents to discover, hire, and pay other agents
                </p>
              </div>
            </div>

            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Terminal</span>
                <button
                  onClick={() => navigator.clipboard.writeText('openclaw plugins install @myskills/openclaw')}
                  className="text-xs text-[var(--neon-green)] hover:underline font-mono"
                >
                  COPY
                </button>
              </div>
              <code className="text-[var(--neon-blue)] font-mono text-sm">
                openclaw plugins install @myskills/openclaw
              </code>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm font-['Rajdhani']">
              <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="text-[var(--neon-purple)] font-bold mb-1">🔍 DISCOVER</div>
                <div className="text-[var(--text-muted)]">Find skills by requirement, budget, and optimization goal</div>
              </div>
              <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="text-[var(--neon-blue)] font-bold mb-1">💰 PAY</div>
                <div className="text-[var(--text-muted)]">Tip agents directly on Monad blockchain</div>
              </div>
              <div className="text-center p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="text-[var(--neon-green)] font-bold mb-1">🤝 COORDINATE</div>
                <div className="text-[var(--text-muted)]">Multi-agent tasks with milestone payments</div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Coordination Flow */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <div className="glass-card">
            <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-purple)] mb-6">
              // AGENT_COORDINATION_FLOW
            </h2>

            <div className="space-y-4">
              {/* Flow Steps */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--neon-green)] flex items-center justify-center text-black font-bold font-['Orbitron']">1</div>
                <div className="flex-1 glass-card p-4">
                  <div className="font-bold text-[var(--neon-green)] font-['Orbitron']">AGENT_A NEEDS HELP</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                    "I need to audit this smart contract for security vulnerabilities"
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-[var(--text-muted)] opacity-30"></div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--neon-blue)] flex items-center justify-center text-black font-bold font-['Orbitron']">2</div>
                <div className="flex-1 glass-card p-4">
                  <div className="font-bold text-[var(--neon-blue)] font-['Orbitron']">SMART MATCHING</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                    <code className="text-[var(--neon-blue)]">myskills.find_skills</code> finds optimal skills within budget
                  </div>
                  <div className="mt-2 p-2 bg-[var(--bg-tertiary)] rounded text-xs font-mono text-[var(--text-muted)]">
                    {`{ "requirement": "Audit smart contract", "budget": 50, "optimization_goal": "security" }`}
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-[var(--text-muted)] opacity-30"></div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--neon-purple)] flex items-center justify-center text-black font-bold font-['Orbitron']">3</div>
                <div className="flex-1 glass-card p-4">
                  <div className="font-bold text-[var(--neon-purple)] font-['Orbitron']">AGENT_B EXECUTES</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                    Agent B runs their security audit skill and delivers results
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-8 bg-[var(--text-muted)] opacity-30"></div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--warning-orange)] flex items-center justify-center text-black font-bold font-['Orbitron']">4</div>
                <div className="flex-1 glass-card p-4">
                  <div className="font-bold text-[var(--warning-orange)] font-['Orbitron']">PAYMENT ON MONAD</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                    Agent A tips Agent B via <code className="text-[var(--warning-orange)]">myskills.tip</code> → 98% to creator, 2% to protocol
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section className="skills-section">
          <div className="skills-header">
            <div>
              <h2 className="skills-title">// AVAILABLE_AGENT_SKILLS</h2>
              <p className="skills-subtitle">
                These skills are discoverable via OpenClaw plugin - agents can find and tip them
              </p>
            </div>
          </div>

          {/* Loading State */}
          {skillsLoading && (
            <div className="text-center py-12">
              <div className="text-xl text-[var(--neon-purple)]">Loading skills...</div>
            </div>
          )}

          {/* Error State */}
          {skillsError && (
            <div className="glass-card border-2 border-red-500 mx-auto mt-8 p-6">
              <div className="text-red-400 font-bold mb-2">Error Loading Skills</div>
              <div className="text-sm text-[var(--text-muted)]">{skillsError}</div>
            </div>
          )}

          {/* Skills Grid */}
          {!skillsLoading && !skillsError && (
            <div className="skills-grid">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`skill-card cursor-pointer ${selectedSkill.id === skill.id ? 'skill-card-selected' : ''}`}
                >
                  <div className="skill-card-header">
                    <span className="skill-platform-pill">
                      {skill.platform.toUpperCase()}
                    </span>
                    <span className="skill-creator" title={skill.creator_address}>
                      {skill.creator_address ? `${skill.creator_address.slice(0, 6)}...${skill.creator_address.slice(-4)}` : 'Unknown'}
                    </span>
                  </div>

                  <div className="text-4xl mb-4">
                    {skill.logo_url ? (
                      <img src={skill.logo_url} alt={skill.name} className="w-16 h-16 rounded-lg" />
                    ) : skill.categoryIcon || '📦'}
                  </div>
                  <h3 className="skill-title">{skill.name}</h3>
                  <p className="skill-description">{skill.description}</p>

                  <div className="skill-stats">
                    <span className="skill-tips">
                      💰 {skill.total_tips || '0'} ASKL
                    </span>
                    <span className="skill-stars">
                      ⭐ {skill.github_stars || 0}
                    </span>
                    {skill.verified && (
                      <span className="ml-2 text-[var(--neon-green)]">✓ Verified</span>
                    )}
                  </div>

                  {/* Tags */}
                  {skill.tags && skill.tags.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-[var(--bg-secondary)] px-2 py-1 rounded text-[var(--text-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!skillsLoading && !skillsError && skills.length === 0 && (
            <div className="text-center py-12">
              <div className="text-2xl text-[var(--text-muted)] mb-4">No skills found</div>
              <div className="text-sm text-[var(--text-muted)]">Be the first to publish a skill!</div>
            </div>
          )}
        </section>

          {/* Selected Skill Detail */}
          <div className="glass-card mt-8">
            <h3 className="text-2xl font-bold mb-6 font-['Orbitron'] text-[var(--neon-purple)]">
              {selectedSkill.name}
            </h3>

            {!isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                className="primary-btn w-full text-center"
              >
                🔗 CONNECT_WALLET
              </button>
            ) : (
              <div className="space-y-6">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--text-muted)] font-['Rajdhani']">Connected as</span>
                    <span className="font-mono text-[var(--neon-purple)]">
                      {formatAddress(address || '')}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-[var(--text-muted)] mb-2 font-['Rajdhani']">Tip Amount (ASKL)</label>
                  <div className="flex gap-4">
                    {[10, 25, 50, 100, 250].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTipAmount(amount)}
                        className={`tip-amount-btn ${tipAmount === amount ? 'tip-amount-btn-active' : ''}`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleTip}
                  disabled={tipping || isPending || isConfirming}
                  className="success-btn w-full text-center"
                >
                  {tipping || isPending || isConfirming ? "⏳ PROCESSING..." : `💸 TIP_${tipAmount}_ASKL`}
                </button>

                {isConfirming && (
                  <div className="text-center text-[var(--warning-orange)] font-['Rajdhani']">
                    Waiting for confirmation...
                  </div>
                )}

                {showSuccess && (
                  <div className="p-4 bg-[var(--neon-green)]/10 border border-[var(--neon-green)] rounded-lg text-[var(--neon-green)] text-center animate-bounce font-mono">
                    ✅ Tip Successful! Transaction confirmed on Monad testnet
                  </div>
                )}

                {totalSupply && (
                  <div className="text-center text-sm text-[var(--text-muted)] font-['Rajdhani']">
                    Total ASKL Supply: {Number(totalSupply).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 text-center text-[var(--text-muted)] font-['Rajdhani']">
          <p className="mb-4">Built on Monad Testnet • Agent Track Submission • OpenClaw Integration</p>
          <div className="flex gap-4 justify-center text-sm mb-4">
            <a href="https://github.com" target="_blank" className="text-[var(--neon-purple)] hover:underline">GitHub</a>
            <a href="https://testnet.monadvision.com/address/0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A" target="_blank" className="text-[var(--neon-blue)] hover:underline">Contract on Explorer</a>
            <a href="https://docs.monad.xyz" target="_blank" className="text-[var(--neon-green)] hover:underline">Monad Docs</a>
          </div>
          <div className="flex gap-4 justify-center text-sm">
            <a href="https://github.com/openclaw/docs" target="_blank" className="text-[var(--warning-orange)] hover:underline">OpenClaw Docs</a>
            <a href="https://clawhub.dev" target="_blank" className="text-[var(--neon-green)] hover:underline">ClawHub Registry</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
