"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseAbi, formatUnits } from "viem";
import { getSeedSkills, getSeedSkillsSummary } from "@/lib/seed-skills";
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

  const [selectedSkill, setSelectedSkill] = useState(DEMO_SKILLS[0]);
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
    setTipping(true);
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: ASKL_TOKEN_ABI,
        functionName: "tipSkill",
        args: [selectedSkill.id as `0x${string}`, BigInt(tipAmount * 1e18)],
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
            <span className="hero-kicker">MOLTIVERSE_DEMO_v1.0</span>
            <h1 className="hero-title">
              <span>AGENT</span> <span>MARKETPLACE</span>
            </h1>
            <p className="hero-subtitle">
              Tip agent skills on Monad Testnet
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

        {/* Skills Section */}
        <section className="skills-section">
          <div className="skills-header">
            <div>
              <h2 className="skills-title">// FEATURED_SKILLS</h2>
              <p className="skills-subtitle">
                Select a skill to tip on Monad Testnet
              </p>
            </div>
          </div>

          <div className="skills-grid">
            {DEMO_SKILLS.map((skill) => (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className={`skill-card cursor-pointer ${selectedSkill.id === skill.id ? 'skill-card-selected' : ''}`}
              >
                <div className="skill-card-header">
                  <span className="skill-platform-pill">
                    {skill.platform.toUpperCase()}
                  </span>
                  <span className="skill-creator" title={skill.creator}>
                    {formatAddress(skill.creator)}
                  </span>
                </div>

                <div className="text-4xl mb-4">{skill.image}</div>
                <h3 className="skill-title">{skill.name}</h3>
                <p className="skill-description">{skill.description}</p>

                <div className="skill-stats">
                  <span className="skill-tips">
                    💰 {skill.totalTips.toLocaleString()} ASKL
                  </span>
                  <span className="skill-stars">
                    ⭐ {skill.totalStars}
                  </span>
                </div>
              </div>
            ))}
          </div>

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
          <p className="mb-4">Built on Monad Testnet • Agent Track Submission</p>
          <div className="flex gap-4 justify-center text-sm">
            <a href="https://github.com" target="_blank" className="text-[var(--neon-purple)] hover:underline">GitHub</a>
            <a href="https://testnet.monadvision.com/address/0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A" target="_blank" className="text-[var(--neon-blue)] hover:underline">Contract on Explorer</a>
            <a href="https://docs.monad.xyz" target="_blank" className="text-[var(--neon-green)] hover:underline">Monad Docs</a>
          </div>
        </footer>
      </main>
    </div>
  );
}
