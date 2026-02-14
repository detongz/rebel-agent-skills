"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseAbi, formatUnits } from "viem";
import { getSeedSkills } from "@/lib/seed-skills";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SecurityScanCard from "@/components/SecurityScanCard";
import ScanReportCard, { ScanResult, getScanDecision } from "@/components/ScanReportCard";

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

const CONTRACT_ADDRESS = "0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A" as `0x${string}`;

export default function DemoPage() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Skills API integration with filtering and sorting
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  // Filtering states
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchCreator, setSearchCreator] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('tips');

  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [tipAmount, setTipAmount] = useState(50);
  const [tipping, setTipping] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Security Scan State
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [showSecurityScanner, setShowSecurityScanner] = useState(false);
  const [scanDecision, setScanDecision] = useState<'ACCEPT' | 'REJECT' | 'REVIEW'>('REVIEW');

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

  // Fetch real skills from API with filters
  useEffect(() => {
    const fetchSkills = async () => {
      setSkillsLoading(true);
      setSkillsError(null);
      try {
        // Build query params
        const params = new URLSearchParams();
        params.append('limit', '12');
        params.append('sort', sortBy);

        if (selectedPlatform !== 'all') {
          params.append('platform', selectedPlatform);
        }
        if (selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchCreator) {
          params.append('creator', searchCreator);
        }

        const response = await fetch(`/api/skills?${params.toString()}`);
        const data = await response.json();
        if (data.success) {
          setSkills(data.data);
          // Auto-select first skill
          if (data.data.length > 0 && !selectedSkill) {
            setSelectedSkill(data.data[0]);
          }
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
  }, [selectedPlatform, selectedCategory, searchCreator, sortBy]);

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

  // Handle security scan completion
  const handleScanComplete = (result: ScanResult) => {
    setScanResult(result);
    const decision = getScanDecision(result);
    setScanDecision(decision.action);

    // Auto-select skill based on security decision
    if (decision.action === 'ACCEPT') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  // Handle hire based on scan decision
  const handleHireFromScan = () => {
    if (scanDecision === 'ACCEPT' || scanDecision === 'REVIEW') {
      setShowSecurityScanner(false);
      // Could pre-fill the selected skill or navigate to hire flow
    }
  };

  // Handle share report
  const handleShareReport = () => {
    if (scanResult) {
      const reportUrl = `${process.env.NEXT_PUBLIC_SKILL_SCAN_URL}/scan/report/${scanResult.scanId}`;
      navigator.clipboard.writeText(reportUrl);
      alert(`Report URL copied: ${reportUrl}`);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <Navbar />
      <nav className="app-nav">
        <div className="nav-left">
          <div className="brand-mark">
            <span className="brand-orb" />
            <span className="brand-text">MySkills_Protocol</span>
          </div>
        </div>
        <div className="nav-right">
          <div className="nav-links-container">
            <Link href="/" className="nav-link">HOME</Link>
            <Link href="/skills-map" className="nav-link">SKILL MAP</Link>
            <Link href="/services" className="nav-link">SERVICES</Link>
            <Link href="/demo-moltiverse" className="nav-link text-[var(--neon-green)]">DEMO</Link>
          </div>
        </div>
      </nav>

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
              <div className="text-3xl font-bold text-[var(--neon-blue)] font-['Orbitron']">&lt;1s</div>
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
                  Install MySkills plugin for OpenClaw to enable your agents to discover, hire, and pay other agents
                </p>
              </div>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)] font-['Rajdhani']">Terminal</span>
                <button
                  onClick={() => navigator.clipboard.writeText('openclaw plugins install @myskills/openclaw')}
                  className="text-xs text-[var(--neon-green)] hover:underline font-mono"
                >
                  COPY
                </button>
              </div>
            </div>
            <code className="text-[var(--neon-blue)] font-mono text-sm">
              openclaw plugins install @myskills/openclaw
            </code>
          </div>
        </section>

        {/* Security Scanner Section */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <SecurityScanCard
            onScanComplete={handleScanComplete}
          />

          {/* Scan Result Display */}
          {scanResult && (
            <div className="mt-6">
              <ScanReportCard
                report={scanResult}
                onShare={handleShareReport}
                onHire={handleHireFromScan}
              />
            </div>
          )}
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

        {/* Technical Stack Comparison Section */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-purple)] mb-6 text-center">
            // TECHNICAL_STACK
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card border-2 border-[var(--neon-green)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">⚛️</div>
                <h3 className="text-xl font-bold font-['Orbitron'] text-[var(--neon-green)]">FRONTEND</h3>
              </div>
              <div className="space-y-3 font-['Rajdhani'] text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--neon-green)]">▸</span>
                  <span>Next.js 14 + React 18</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--neon-green)]">▸</span>
                  <span>SQLite (better-sqlite3)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--neon-green)]">▸</span>
                  <span>TypeScript + TailwindCSS</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--neon-green)]">▸</span>
                  <span>Wagmi + RainbowKit</span>
                </div>
              </div>
            </div>

            <div className="glass-card border-2 border-[var(--neon-blue)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">🔧</div>
                <h3 className="text-xl font-bold font-['Orbitron'] text-[var(--neon-blue)]">API & PROTOCOL</h3>
              </div>
              <div className="space-y-3 font-['Rajdhani'] text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <span className="text-[var(--neon-blue)]">▸</span>
                  <span>RESTful API Routes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--neon-blue)]">▸</span>
                  <span>Solidity Smart Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--neon-blue)]">▸</span>
                  <span>Monad Testnet Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--neon-blue)]">▸</span>
                  <span>OpenClaw MCP Plugin</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Agent Economy Section */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-green)] mb-6 text-center">
            // AGENT_ECONOMY
          </h2>
          <div className="glass-card border-2 border-[var(--neon-green)]">
            <div className="text-center mb-8">
              <p className="text-lg text-[var(--text-secondary)] font-['Rajdhani']">
                A two-sided marketplace where agents can hire and pay each other for skills
              </p>
            </div>

            {/* Economy Flow */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="w-12 h-12 rounded-full bg-[var(--neon-blue)] flex items-center justify-center text-black font-bold font-['Orbitron']">1</div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--neon-blue)] font-['Orbitron']">TASK RUNNER HIRES SKILL</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                    Agent A uses <code className="text-[var(--neon-blue)]">myskills.hire</code> to find and execute a skill
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-[var(--text-muted)] opacity-30"></div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="w-12 h-12 rounded-full bg-[var(--neon-purple)] flex items-center justify-center text-black font-bold font-['Orbitron']">2</div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--neon-purple)] font-['Orbitron']">SKILL EXECUTES & DELIVERS</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                    Skill B processes the request and returns results
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <div className="w-0.5 h-6 bg-[var(--text-muted)] opacity-30"></div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] rounded-lg">
                <div className="w-12 h-12 rounded-full bg-[var(--neon-green)] flex items-center justify-center text-black font-bold font-['Orbitron']">3</div>
                <div className="flex-1">
                  <div className="font-bold text-[var(--neon-green)] font-['Orbitron']">PAYMENT DISTRIBUTION</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">
                    <span className="text-[var(--neon-green)]">98% to Skill Creator</span> • <span className="text-[var(--neon-purple)]">2% to Protocol</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Incentive Loop */}
            <div className="mt-8 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-card)]">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">🔄</span>
                <span className="text-lg font-bold font-['Orbitron'] text-[var(--warning-orange)]">INCENTIVE LOOP</span>
              </div>
              <p className="text-center text-sm text-[var(--text-muted)] font-['Rajdhani']">
                More skills → More agents → More transactions → Higher quality skills
              </p>
            </div>
          </div>
        </section>

        {/* Competitive Advantage Section */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--warning-orange)] mb-6 text-center">
            // WHY_MYSKILLS
          </h2>
          <div className="glass-card border-2 border-[var(--warning-orange)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-['Rajdhani']">
                <thead>
                  <tr className="border-b border-[var(--border-card)]">
                    <th className="py-3 px-4 text-[var(--warning-orange)] font-bold">FEATURE</th>
                    <th className="py-3 px-4 text-[var(--neon-green)] font-bold">MySkills</th>
                    <th className="py-3 px-4 text-[var(--text-muted)]">npm</th>
                    <th className="py-3 px-4 text-[var(--text-muted)]">GitHub</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border-card)]">
                    <td className="py-3 px-4 text-[var(--text-secondary)]">Agent-Specific</td>
                    <td className="py-3 px-4 text-[var(--neon-green)]">✓ Built for AI Agents</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ Package registry</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ Code hosting</td>
                  </tr>
                  <tr className="border-b border-[var(--border-card)]">
                    <td className="py-3 px-4 text-[var(--text-secondary)]">Security Scoring</td>
                    <td className="py-3 px-4 text-[var(--neon-green)]">✓ Real-time scores</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ None</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ None</td>
                  </tr>
                  <tr className="border-b border-[var(--border-card)]">
                    <td className="py-3 px-4 text-[var(--text-secondary)]">Hiring Economy</td>
                    <td className="py-3 px-4 text-[var(--neon-green)]">✓ Built-in payments</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ None</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ Sponsorships only</td>
                  </tr>
                  <tr className="border-b border-[var(--border-card)]">
                    <td className="py-3 px-4 text-[var(--text-secondary)]">Real-time Rankings</td>
                    <td className="py-3 px-4 text-[var(--neon-green)]">✓ Tips, stars, likes</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ Downloads only</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ Stars only</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-[var(--text-secondary)]">Performance</td>
                    <td className="py-3 px-4 text-[var(--neon-green)]">✓ 10k TPS, &lt;1s finality</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ Centralized</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">✗ Centralized</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="max-w-4xl mx-auto px-6 mb-12">
          <h2 className="text-2xl font-bold font-['Orbitron'] text-[var(--neon-purple)] mb-6 text-center">
            // TEAM
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Team Member 1 */}
            <div className="glass-card text-center p-6 hover:scale-105 transition-transform">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--neon-green)] to-[var(--neon-blue)] flex items-center justify-center text-3xl">
                👨‍💻
              </div>
              <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--text-primary)] mb-1">Alex Chen</h3>
              <p className="text-sm text-[var(--neon-green)] font-['Rajdhani'] mb-2">Protocol Lead</p>
              <p className="text-xs text-[var(--text-muted)]">Smart contracts • Monad integration</p>
            </div>

            {/* Team Member 2 */}
            <div className="glass-card text-center p-6 hover:scale-105 transition-transform">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-blue)] flex items-center justify-center text-3xl">
                👩‍🔬
              </div>
              <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--text-primary)] mb-1">Sarah Kim</h3>
              <p className="text-sm text-[var(--neon-purple)] font-['Rajdhani'] mb-2">AI/ML Engineer</p>
              <p className="text-xs text-[var(--text-muted)]">Agent workflows • MCP protocol</p>
            </div>

            {/* Team Member 3 */}
            <div className="glass-card text-center p-6 hover:scale-105 transition-transform">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--warning-orange)] to-[var(--neon-purple)] flex items-center justify-center text-3xl">
                👨‍🎨
              </div>
              <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--text-primary)] mb-1">Mike Torres</h3>
              <p className="text-sm text-[var(--warning-orange)] font-['Rajdhani'] mb-2">Frontend Lead</p>
              <p className="text-xs text-[var(--text-muted)]">Next.js • Wallet integration • UI/UX</p>
            </div>

            {/* Team Member 4 */}
            <div className="glass-card text-center p-6 hover:scale-105 transition-transform">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--neon-blue)] to-[var(--neon-green)] flex items-center justify-center text-3xl">
                👩‍💼
              </div>
              <h3 className="text-lg font-bold font-['Orbitron'] text-[var(--text-primary)] mb-1">Emma Zhang</h3>
              <p className="text-sm text-[var(--neon-blue)] font-['Rajdhani'] mb-2">Product Lead</p>
              <p className="text-xs text-[var(--text-muted)]">Product strategy • Community • Growth</p>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-[var(--text-muted)] font-['Rajdhani'] mb-4">
              Join us in building the future of agent-to-agent commerce
            </p>
            <div className="flex gap-4 justify-center">
              <a href="https://github.com" target="_blank" className="text-[var(--neon-green)] hover:underline text-sm">
                GitHub
              </a>
              <a href="https://twitter.com" target="_blank" className="text-[var(--neon-blue)] hover:underline text-sm">
                Twitter
              </a>
              <a href="https://discord.gg/TfzSeSRZ" target="_blank" className="text-[var(--neon-purple)] hover:underline text-sm">
                Discord
              </a>
            </div>
          </div>
        </section>

        {/* Skills Section with Filters */}
        <section className="skills-section">
          <div className="skills-header">
            <div>
              <h2 className="skills-title">// AVAILABLE_AGENT_SKILLS</h2>
              <p className="skills-subtitle">
                These skills are discoverable via OpenClaw plugin - agents can find and tip them
              </p>
            </div>
          </div>

          {/* Filter Controls */}
          <div className="glass-card border-2 border-[var(--neon-purple)] p-4 mb-6">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              {/* Platform Filter */}
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="bg-[var(--bg-secondary)] text-white px-4 py-2 rounded-lg border border-[var(--border-card)] focus:ring-2 focus:ring-[var(--neon-orange)]"
              >
                <option value="all">All Platforms</option>
                <option value="claude-code">Claude Code</option>
                <option value="manus">Manus</option>
                <option value="minimax">MiniMax</option>
                <option value="custom">Custom</option>
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-[var(--bg-secondary)] text-white px-4 py-2 rounded-lg border border-[var(--border-card)] focus:ring-2 focus:ring-[var(--neon-orange)]"
              >
                <option value="all">All Categories</option>
                <option value="security">🛡️ Security</option>
                <option value="defi">💰 DeFi</option>
                <option value="development">👨‍💻 Development</option>
                <option value="analytics">📊 Analytics</option>
                <option value="education">📚 Education</option>
              </select>

              {/* Creator Search */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by creator address..."
                  value={searchCreator}
                  onChange={(e) => setSearchCreator(e.target.value)}
                  className="flex-1 bg-[var(--bg-secondary)] text-white px-4 py-2 rounded-lg border border-[var(--border-card)] focus:ring-2 focus:ring-[var(--neon-orange)]"
                />
              </div>

              {/* Clear Filters Button */}
              {(selectedPlatform !== 'all' || selectedCategory !== 'all' || searchCreator) && (
                <button
                  onClick={() => {
                    setSelectedPlatform('all');
                    setSelectedCategory('all');
                    setSearchCreator('');
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-600/30 text-white font-semibold transition"
                >
                  ✕ Clear Filters
                </button>
              )}
            </div>

            {/* Sort Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSortBy('tips')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${sortBy === 'tips' ? 'bg-[var(--neon-orange)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
              >
                🔥 Tips
              </button>
              <button
                onClick={() => setSortBy('stars')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${sortBy === 'stars' ? 'bg-[var(--neon-orange)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
              >
                ⭐ Stars
              </button>
              <button
                onClick={() => setSortBy('likes')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${sortBy === 'likes' ? 'bg-[var(--neon-orange)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
              >
                💜 Likes
              </button>
            </div>

            {/* Result Count */}
            <div className="text-center text-sm text-[var(--text-muted)] mt-2">
              Showing {skills.length} skills
              {(selectedPlatform !== 'all' || selectedCategory !== 'all' || searchCreator) && (
                <span className="text-[var(--neon-orange)] ml-2"> (filtered)</span>
              )}
            </div>
          </div>

          {/* Skills Grid */}
          {!skillsLoading && !skillsError && skills.length > 0 && (
            <div className="skills-grid">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  onClick={() => setSelectedSkill(skill)}
                  className={`skill-card cursor-pointer ${selectedSkill?.id === skill.id ? 'skill-card-selected' : ''}`}
                >
                  <div className="skill-card-header">
                    <span className="skill-platform-pill">
                      {skill.platform.toUpperCase()}
                    </span>
                    {(selectedPlatform !== 'all' || selectedCategory !== 'all' || searchCreator) && (
                      <span className="ml-2 text-xs bg-[var(--neon-orange)] px-2 py-1 rounded">🔍</span>
                    )}
                    <span className="skill-creator" title={skill.creator_address}>
                      {skill.creator_address ? `${skill.creator_address.slice(0, 6)}...${skill.creator_address.slice(-4)}` : 'Unknown'}
                    </span>
                  </div>

                  <div className="text-4xl mb-4">
                    {skill.logo_url ? (
                      <img src={skill.logo_url} alt={skill.name} className="w-16 h-16 rounded-lg object-cover" />
                    ) : getCategoryIcon(skill.category)}
                  </div>
                  <h3 className="skill-title">{skill.name}</h3>
                  <p className="skill-description">{skill.description}</p>

                  <div className="skill-stats">
                    <span className="skill-tips">
                      💰 {skill.total_tips || '0'} ASKL
                      {sortBy === 'tips' && (
                        <span className="ml-2 text-xs bg-[var(--neon-orange)] px-2 py-1 rounded">TOP</span>
                      )}
                    </span>
                    <span className="skill-stars">
                      ⭐ {skill.github_stars || 0}
                      {sortBy === 'stars' && (
                        <span className="ml-2 text-xs bg-[var(--neon-orange)] px-2 py-1 rounded">TOP</span>
                      )}
                    </span>
                  </div>

                  {skill.tags && skill.tags.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-[var(--bg-secondary)] px-2 py-1 rounded text-[var(--text-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {skill.verified && (
                    <span className="ml-2 text-[var(--neon-green)]">✓ Verified</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!skillsLoading && !skillsError && skills.length === 0 && (
            <div className="text-center py-12">
              <div className="text-2xl text-[var(--text-muted)] mb-4">No skills found</div>
              <div className="text-sm text-[var(--text-muted)]">
                {(selectedPlatform !== 'all' || selectedCategory !== 'all' || searchCreator) ? (
                  <>Try adjusting your filters</>
                ) : (
                  <>Be the first to publish a skill!</>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedPlatform('all');
                  setSelectedCategory('all');
                  setSearchCreator('');
                }}
                className="mt-6 px-8 py-3 bg-[var(--neon-purple)] rounded-lg text-white font-semibold hover:bg-[var(--neon-orange)] transition"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Loading State */}
          {skillsLoading && (
            <div className="text-center py-12">
              <div className="text-2xl text-[var(--neon-purple)]">Loading skills...</div>
            </div>
          )}

          {/* Error State */}
          {skillsError && (
            <div className="glass-card border-2 border-red-500 mx-auto mt-8 p-6">
              <div className="text-red-400 font-bold mb-2">Error Loading Skills</div>
              <div className="text-sm text-[var(--text-muted)]">{skillsError}</div>
            </div>
          )}

        {/* Selected Skill Detail */}
        {selectedSkill && (
          <div className="glass-card mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-4xl mb-4">
                  {selectedSkill.logo_url ? (
                    <img src={selectedSkill.logo_url} alt={selectedSkill.name} className="w-20 h-20 rounded-xl" />
                  ) : (
                    <div className="text-5xl">{getCategoryIcon(selectedSkill.category)}</div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedSkill(null)}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="text-right">
                <div className="text-sm text-[var(--text-muted)]">
                  Created by
                </div>
                <div className="text-sm font-mono">
                  {selectedSkill.creator_address ? `${selectedSkill.creator_address.slice(0, 6)}...${selectedSkill.creator_address.slice(-4)}` : 'Unknown'}
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6 font-['Orbitron'] text-[var(--neon-purple)]">
              {selectedSkill.name}
            </h2>

            <p className="text-lg text-[var(--text-secondary)] mb-6">{selectedSkill.description}</p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="glass-card p-4">
                <div className="text-sm text-[var(--text-muted)] mb-2">Platform</div>
                <div className="text-lg font-semibold">{selectedSkill.platform}</div>
              </div>

              <div className="glass-card p-4">
                <div className="text-sm text-[var(--text-muted)] mb-2">Total Tips</div>
                <div className="text-lg font-semibold">{selectedSkill.total_tips || '0'} ASKL</div>
              </div>

              <div className="glass-card p-4">
                <div className="text-sm text-[var(--text-muted)] mb-2">GitHub Stars</div>
                <div className="text-lg font-semibold">{selectedSkill.github_stars || 0}</div>
              </div>

              <div className="glass-card p-4">
                <div className="text-sm text-[var(--text-muted)] mb-2">Downloads</div>
                <div className="text-lg font-semibold">{selectedSkill.download_count || 0}</div>
              </div>

              {selectedSkill.repository && (
                <div className="glass-card p-4">
                  <div className="text-sm text-[var(--text-muted)] mb-2">Repository</div>
                  <a
                    href={selectedSkill.repository}
                    target="_blank"
                    className="text-[var(--neon-cyan)] hover:underline"
                  >
                    {selectedSkill.repository}
                  </a>
                </div>
              )}
            </div>

            <div className="glass-card p-4">
              <div className="text-sm text-[var(--text-muted)] mb-2">Homepage</div>
              <div className="text-lg font-semibold">
                {selectedSkill.homepage ? (
                  <a
                    href={selectedSkill.homepage}
                    target="_blank"
                    className="text-[var(--neon-cyan)] hover:underline break-all"
                  >
                    {selectedSkill.homepage}
                  </a>
                ) : (
                  <span className="text-[var(--text-muted)]">No homepage</span>
                )}
              </div>
            </div>

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
                    <span className="text-sm text-[var(--text-muted)]">Connected as</span>
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
                        className={`flex-1 py-2 px-4 rounded-lg font-semibold transition border ${tipAmount === amount ? 'bg-[var(--neon-orange)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
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
              </div>
            )}
          </div>
        )}
        </section>

        {/* Footer */}
        <footer className="py-12 text-center text-[var(--text-muted)] font-['Rajdhani']">
          <p className="mb-4">Built on Monad Testnet • Agent Track Submission • OpenClaw Integration</p>
          <div className="flex gap-4 justify-center text-sm mb-4">
            <a href="https://github.com" target="_blank" className="text-[var(--neon-purple)] hover:underline">GitHub</a>
            <a href="https://testnet.monad.xyz/address/0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A" target="_blank" className="text-[var(--neon-blue)] hover:underline">Contract on Explorer</a>
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
