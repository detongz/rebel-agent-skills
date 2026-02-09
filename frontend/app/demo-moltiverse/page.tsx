"use client";

import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { injected } from "wagmi/connectors";
import { parseAbi, formatUnits } from "viem";

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

// Demo skills
const DEMO_SKILLS = [
  {
    id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    name: "Solidity Auditor",
    description: "AI-powered smart contract security audit with vulnerability detection",
    platform: "claude-code",
    creator: "0x7F0bDc7dFb0A601f24eBbFD7fd3514575ecBE08b",
    totalTips: 12500,
    totalStars: 42,
    image: "🛡️",
  },
  {
    id: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    name: "React Component Generator",
    description: "Generate production-ready React components from natural language",
    platform: "coze",
    creator: "0xABCDEF1234567890ABCDEF1234567890ABCDEF12",
    totalTips: 8750,
    totalStars: 38,
    image: "⚛️",
  },
  {
    id: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
    name: "Data Visualization Agent",
    description: "Transform raw data into beautiful charts and insights automatically",
    platform: "manus",
    creator: "0xDEF4567890123456789012345678901234567890",
    totalTips: 15200,
    totalStars: 55,
    image: "📊",
  },
];

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        </div>

        <div className="relative z-10 text-center px-8">
          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
            MySkills
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4">
            Agent Skill Marketplace
          </p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            The first cross-platform reward protocol for AI agent skills
          </p>
          <div className="flex gap-4 justify-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-4 border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-400">10,000+</div>
              <div className="text-sm text-gray-400">TPS on Monad</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-4 border border-blue-500/30">
              <div className="text-3xl font-bold text-blue-400">&lt; 1s</div>
              <div className="text-sm text-gray-400">Finality Time</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-4 border border-pink-500/30">
              <div className="text-3xl font-bold text-pink-400">~$0.001</div>
              <div className="text-sm text-gray-400">Per Transaction</div>
            </div>
          </div>
          <button
            onClick={() => document.getElementById("skills")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-12 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full font-semibold text-lg hover:scale-105 transition-transform"
          >
            Explore Skills ↓
          </button>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="py-20 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">Featured Skills</h2>
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {DEMO_SKILLS.map((skill) => (
              <div
                key={skill.id}
                onClick={() => setSelectedSkill(skill)}
                className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedSkill.id === skill.id
                    ? "border-purple-500 bg-purple-500/10 scale-105"
                    : "border-gray-700 bg-gray-800/50 hover:border-purple-500/50"
                }`}
              >
                <div className="text-4xl mb-4">{skill.image}</div>
                <h3 className="text-xl font-bold mb-2">{skill.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{skill.description}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-purple-400">💰 {skill.totalTips.toLocaleString()} ASKL</span>
                  <span className="text-yellow-400">⭐ {skill.totalStars}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Skill Detail */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30">
            <h3 className="text-2xl font-bold mb-6">{selectedSkill.name}</h3>

            {!isConnected ? (
              <button
                onClick={() => connect({ connector: injected() })}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold text-lg hover:scale-105 transition-transform"
              >
                Connect Wallet to Tip
              </button>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
                  <span className="text-gray-400">Connected as</span>
                  <span className="font-mono text-purple-400">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tip Amount (ASKL)</label>
                  <div className="flex gap-4">
                    {[10, 25, 50, 100, 250].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setTipAmount(amount)}
                        className={`px-4 py-2 rounded-lg font-mono transition-all ${
                          tipAmount === amount
                            ? "bg-purple-500 text-white"
                            : "bg-gray-700 hover:bg-gray-600"
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleTip}
                  disabled={tipping || isPending || isConfirming}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {tipping || isPending || isConfirming ? "Processing..." : `Tip ${tipAmount} ASKL`}
                </button>

                {isConfirming && (
                  <div className="text-center text-yellow-400">
                    Waiting for confirmation...
                  </div>
                )}

                {showSuccess && (
                  <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-center animate-bounce">
                    ✅ Tip Successful! Transaction confirmed on Monad testnet
                  </div>
                )}

                {totalSupply && (
                  <div className="text-center text-sm text-gray-400">
                    Total ASKL Supply: {Number(totalSupply).toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-400">
        <p className="mb-4">Built on Monad Testnet • Agent Track Submission</p>
        <div className="flex gap-4 justify-center text-sm">
          <a href="https://github.com" target="_blank" className="text-purple-400 hover:underline">GitHub</a>
          <a href="https://testnet.monadvision.com/address/0xc1fFCAD15e2f181E49bFf2cBea79094eC9B5033A" target="_blank" className="text-blue-400 hover:underline">Contract on Explorer</a>
          <a href="https://docs.monad.xyz" target="_blank" className="text-pink-400 hover:underline">Monad Docs</a>
        </div>
      </footer>
    </div>
  );
}
