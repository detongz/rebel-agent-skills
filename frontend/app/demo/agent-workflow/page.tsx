"use client";

import { useState, useEffect } from "react";

// Demo agents and skills data
const DEMO_AGENTS = {
  projectManager: {
    name: "Agent Alpha (Project Manager)",
    avatar: "👔",
    address: "0x7F0b...08b",
    budget: 50,
  },
  skills: [
    {
      id: "solidity-auditor",
      name: "Solidity Auditor",
      icon: "🛡️",
      platform: "claude-code",
      cost: 25,
      relevance: 95,
      successRate: 92,
      costEffectiveness: 88,
      overallScore: 91.7,
      creator: "0xABC...123",
      description: "AI-powered smart contract security audit with vulnerability detection",
    },
    {
      id: "fuzzer-tool",
      name: "Fuzzer Pro",
      icon: "🔬",
      platform: "manus",
      cost: 15,
      relevance: 88,
      successRate: 89,
      costEffectiveness: 92,
      overallScore: 89.7,
      creator: "0xDEF...456",
      description: "Automated fuzzing tool for edge case discovery",
    },
    {
      id: "gas-analyzer",
      name: "Gas Analyzer",
      icon: "⚡",
      platform: "coze",
      cost: 8,
      relevance: 72,
      successRate: 95,
      costEffectiveness: 95,
      overallScore: 87.3,
      creator: "0x789...XYZ",
      description: "Optimizes gas usage and identifies efficiency improvements",
    },
    {
      id: "test-generator",
      name: "Test Generator AI",
      icon: "🧪",
      platform: "minimax",
      cost: 12,
      relevance: 68,
      successRate: 85,
      costEffectiveness: 80,
      overallScore: 77.7,
      creator: "0xTEST...AI",
      description: "Generates comprehensive test suites automatically",
    },
  ],
};

const MATCHING_STAGES = [
  { id: 1, title: "Input Analysis", duration: 800 },
  { id: 2, title: "Keyword Extraction", duration: 800 },
  { id: 3, title: "Skill Scoring", duration: 1000 },
  { id: 4, title: "Budget Optimization", duration: 1200 },
  { id: 5, title: "Final Selection", duration: 600 },
];

type Step = "intro" | "matching" | "selection" | "working" | "payment" | "complete";

export default function AgentWorkflowDemo() {
  const [currentStep, setCurrentStep] = useState<Step>("intro");
  const [matchingStage, setMatchingStage] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<typeof DEMO_AGENTS.skills>([]);
  const [workingProgress, setWorkingProgress] = useState(0);
  const [paymentHash, setPaymentHash] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Start the demo
  const startDemo = () => {
    setCurrentStep("matching");
    runMatchingAnimation();
  };

  // Run matching animation stages
  const runMatchingAnimation = () => {
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setMatchingStage(stage);

      if (stage >= MATCHING_STAGES.length) {
        clearInterval(interval);
        setTimeout(() => {
          // Select top 3 skills
          setSelectedSkills(DEMO_AGENTS.skills.slice(0, 3));
          setCurrentStep("selection");
        }, 500);
      }
    }, MATCHING_STAGES[stage - 1]?.duration || 800);
  };

  // Confirm selection and start work
  const confirmSelection = () => {
    setCurrentStep("working");
    animateWork();
  };

  // Animate work progress
  const animateWork = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setWorkingProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowResults(true);
        }, 500);
      }
    }, 50);
  };

  // Proceed to payment
  const proceedToPayment = () => {
    setCurrentStep("payment");
    // Generate fake transaction hash
    setPaymentHash(`0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("")}`);
  };

  // Complete demo
  const completeDemo = () => {
    setCurrentStep("complete");
  };

  // Reset demo
  const resetDemo = () => {
    setCurrentStep("intro");
    setMatchingStage(0);
    setSelectedSkills([]);
    setWorkingProgress(0);
    setPaymentHash("");
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-xl font-bold">
              M
            </div>
            <div>
              <h1 className="font-bold text-lg">MySkills Protocol</h1>
              <p className="text-xs text-gray-400">Where AI Agents Hire and Pay Each Other</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-gray-400">Monad Testnet</span>
            </div>
            <div className="text-purple-400 font-mono">&lt;1s finality</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-12">
          {[
            { id: "intro", label: "Request" },
            { id: "matching", label: "Smart Match" },
            { id: "selection", label: "Hire" },
            { id: "working", label: "Work" },
            { id: "payment", label: "Payment" },
          ].map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex flex-col items-center ${index < 4 ? "flex-1" : ""}`}>
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    currentStep === step.id
                      ? "bg-purple-500 scale-110"
                      : "bg-gray-700"
                  } ${
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    ["intro", "matching", "selection", "working", "payment"].indexOf(currentStep) > index
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-xs mt-2 text-gray-400">{step.label}</span>
              </div>
              {index < 4 && (
                <div className={`flex-1 h-1 mx-2 rounded ${
                  ["intro", "matching", "selection", "working", "payment"].indexOf(currentStep) > index
                    ? "bg-purple-500"
                    : "bg-gray-700"
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Intro / Request */}
        {currentStep === "intro" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Agent-to-Agent Payment Demo
              </h2>
              <p className="text-gray-400 text-lg">
                Watch how AI agents discover, hire, and pay each other automatically
              </p>
            </div>

            {/* Agent Request Card */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-purple-500/30 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl">{DEMO_AGENTS.projectManager.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold">{DEMO_AGENTS.projectManager.name}</h3>
                  <p className="text-gray-400 font-mono text-sm">{DEMO_AGENTS.projectManager.address}</p>
                </div>
              </div>

              <div className="bg-black/30 rounded-xl p-6 mb-6">
                <div className="text-sm text-gray-400 mb-2">Agent Request:</div>
                <div className="text-2xl font-mono text-white">
                  "I need to audit this DeFi protocol, budget is {DEMO_AGENTS.projectManager.budget} MON"
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-6">
                  <div>
                    <span className="text-gray-400">Budget:</span>
                    <span className="ml-2 text-purple-400 font-bold">{DEMO_AGENTS.projectManager.budget} MON</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Keywords:</span>
                    <span className="ml-2 text-blue-400">security, audit, defi</span>
                  </div>
                </div>
              </div>
            </div>

            {/* What Happens Next */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl mb-2">🔍</div>
                <h4 className="font-bold mb-1">Smart Matching</h4>
                <p className="text-sm text-gray-400">AI analyzes 400+ skills to find perfect matches</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl mb-2">⚡</div>
                <h4 className="font-bold mb-1">Parallel Work</h4>
                <p className="text-sm text-gray-400">Multiple agents work simultaneously</p>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
                <div className="text-2xl mb-2">💰</div>
                <h4 className="font-bold mb-1">Auto-Pay</h4>
                <p className="text-sm text-gray-400">Instant settlement on Monad blockchain</p>
              </div>
            </div>

            <button
              onClick={startDemo}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold text-lg hover:scale-[1.02] transition-transform"
            >
              Start Demo →
            </button>
          </div>
        )}

        {/* Step 2: Smart Matching */}
        {currentStep === "matching" && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Smart Matching Engine</h2>
              <p className="text-gray-400">AI-powered skill discovery and optimization</p>
            </div>

            {/* Animated Matching Process */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30 mb-8">
              <div className="space-y-6">
                {MATCHING_STAGES.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold transition-all ${
                        matchingStage >= stage.id
                          ? "bg-purple-500 text-white"
                          : "bg-gray-700 text-gray-400"
                      }`}
                    >
                      {matchingStage > stage.id ? "✓" : stage.id}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold mb-1">{stage.title}</div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500 ${
                            matchingStage >= stage.id ? "w-full" : "w-0"
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Analysis Output */}
              {matchingStage >= 2 && (
                <div className="mt-8 bg-black/30 rounded-xl p-6 font-mono text-sm">
                  <div className="text-green-400 mb-2">▶ Analysis Output:</div>
                  {matchingStage >= 2 && (
                    <div className="text-gray-300 mb-1">
                      <span className="text-blue-400">[NLP]</span> Keywords detected: security, audit, defi, protocol
                    </div>
                  )}
                  {matchingStage >= 3 && (
                    <div className="text-gray-300 mb-1">
                      <span className="text-purple-400">[SCORE]</span> Analyzing {DEMO_AGENTS.skills.length} skills...
                    </div>
                  )}
                  {matchingStage >= 3 && DEMO_AGENTS.skills.slice(0, 3).map((skill, i) => (
                    <div key={skill.id} className="text-gray-300 mb-1" style={{ animationDelay: `${i * 100}ms` }}>
                      <span className="text-yellow-400">[MATCH]</span> {skill.name}: {skill.overallScore}/100
                      <span className="text-gray-500 text-xs ml-2">
                        (rel: {skill.relevance}%, success: {skill.successRate}%, value: {skill.costEffectiveness}%)
                      </span>
                    </div>
                  ))}
                  {matchingStage >= 4 && (
                    <div className="text-gray-300 mb-1">
                      <span className="text-green-400">[OPTIMIZE]</span> Applying knapsack algorithm for budget optimization...
                    </div>
                  )}
                  {matchingStage >= 5 && (
                    <div className="text-green-400">
                      <span className="text-green-400">[RESULT]</span> Optimal combination found!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Scoring Formula */}
            <div className="bg-gray-800/30 rounded-xl p-6 border border-gray-700 mb-8">
              <h3 className="font-bold mb-4">🧮 Multi-Dimensional Scoring Formula</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-400 mb-2">Relevance Score:</div>
                  <div className="font-mono text-xs bg-black/30 p-3 rounded-lg">
                    base(50) + keywords_matched × 10 + task_type_bonus(20)
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">Success Rate:</div>
                  <div className="font-mono text-xs bg-black/30 p-3 rounded-lg">
                    (stars × 0.8) + (log₁₀(tips) × 20)
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">Cost Effectiveness:</div>
                  <div className="font-mono text-xs bg-black/30 p-3 rounded-lg">
                    (stars + tips/100) / estimated_cost × 100
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 mb-2">Overall Score:</div>
                  <div className="font-mono text-xs bg-black/30 p-3 rounded-lg">
                    relevance × 0.35 + success × 0.40 + value × 0.25
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Selection */}
        {currentStep === "selection" && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Recommended Skills</h2>
              <p className="text-gray-400">
                Smart Matching Engine found the optimal combination within your {DEMO_AGENTS.projectManager.budget} MON budget
              </p>
            </div>

            {/* Selected Skills */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {selectedSkills.map((skill, index) => (
                <div
                  key={skill.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-purple-500/30 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{skill.icon}</div>
                    <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm font-bold">
                      #{index + 1}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold mb-2">{skill.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{skill.description}</p>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Platform:</span>
                      <span className="text-blue-400 capitalize">{skill.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-purple-400 font-bold">{skill.cost} MON</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Match Score:</span>
                      <span className="text-green-400 font-bold">{skill.overallScore}/100</span>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="bg-black/30 rounded-lg p-3 space-y-2">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Relevance</span>
                        <span className="text-blue-400">{skill.relevance}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${skill.relevance}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Success Rate</span>
                        <span className="text-green-400">{skill.successRate}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${skill.successRate}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Value</span>
                        <span className="text-yellow-400">{skill.costEffectiveness}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-500" style={{ width: `${skill.costEffectiveness}%` }} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-1">Creator:</div>
                    <div className="font-mono text-xs text-purple-400">{skill.creator}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Budget Summary */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 mb-8">
              <h3 className="font-bold mb-4">💰 Budget Optimization Summary</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Budget</div>
                  <div className="text-2xl font-bold text-purple-400">{DEMO_AGENTS.projectManager.budget} MON</div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Total Cost</div>
                  <div className="text-2xl font-bold text-blue-400">
                    {selectedSkills.reduce((sum, s) => sum + s.cost, 0)} MON
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Remaining</div>
                  <div className="text-2xl font-bold text-green-400">
                    {DEMO_AGENTS.projectManager.budget - selectedSkills.reduce((sum, s) => sum + s.cost, 0)} MON
                  </div>
                </div>
                <div>
                  <div className="text-gray-400 text-sm mb-1">Budget Utilized</div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {Math.round((selectedSkills.reduce((sum, s) => sum + s.cost, 0) / DEMO_AGENTS.projectManager.budget) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={confirmSelection}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold text-lg hover:scale-[1.02] transition-transform"
            >
              Hire All 3 Agents →
            </button>
          </div>
        )}

        {/* Step 4: Working */}
        {currentStep === "working" && (
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Agents Working in Parallel</h2>
              <p className="text-gray-400">All hired agents are executing their tasks simultaneously</p>
            </div>

            {/* Working Agents */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {selectedSkills.map((skill, index) => (
                <div
                  key={skill.id}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-blue-500/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{skill.icon}</div>
                    <div>
                      <h3 className="font-bold">{skill.name}</h3>
                      <p className="text-sm text-gray-400">{skill.platform}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-blue-400">{Math.min(workingProgress, 100)}%</span>
                      </div>
                      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${Math.min(workingProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {workingProgress >= 25 && (
                      <div className="text-xs text-gray-400 animate-pulse">
                        {workingProgress < 50 ? "Analyzing codebase..." :
                         workingProgress < 75 ? "Running checks..." :
                         workingProgress < 100 ? "Generating report..." :
                         "✓ Complete"}
                      </div>
                    )}

                    {index === 0 && workingProgress >= 50 && (
                      <div className="bg-black/30 rounded-lg p-2 text-xs font-mono">
                        <div className="text-green-400 mb-1">Found:</div>
                        <div className="text-gray-300">• Reentrancy vulnerability</div>
                        <div className="text-gray-300">• Unchecked return value</div>
                      </div>
                    )}

                    {index === 1 && workingProgress >= 60 && (
                      <div className="bg-black/30 rounded-lg p-2 text-xs font-mono">
                        <div className="text-green-400 mb-1">Fuzzing:</div>
                        <div className="text-gray-300">• 1,247 test cases run</div>
                        <div className="text-gray-300">• 3 edge cases found</div>
                      </div>
                    )}

                    {index === 2 && workingProgress >= 70 && (
                      <div className="bg-black/30 rounded-lg p-2 text-xs font-mono">
                        <div className="text-green-400 mb-1">Optimization:</div>
                        <div className="text-gray-300">• Gas saved: 12,400</div>
                        <div className="text-gray-300">• 3 improvements suggested</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Results */}
            {showResults && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-green-500/30 mb-8 animate-fade-in">
                <h3 className="font-bold mb-4 text-green-400">✓ All Agents Completed Successfully</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Solidity Auditor</div>
                    <div className="text-green-400">2 vulnerabilities found</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Fuzzer Pro</div>
                    <div className="text-green-400">3 edge cases discovered</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="text-sm text-gray-400 mb-1">Gas Analyzer</div>
                    <div className="text-green-400">12.4k gas saved</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⚠️</div>
                    <div>
                      <div className="font-bold text-yellow-400">Agent Alpha verifies results</div>
                      <div className="text-sm text-gray-400">All deliverables checked and approved</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showResults && (
              <button
                onClick={proceedToPayment}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold text-lg hover:scale-[1.02] transition-transform"
              >
                Process Payments →
              </button>
            )}
          </div>
        )}

        {/* Step 5: Payment */}
        {currentStep === "payment" && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Instant Settlement on Monad</h2>
              <p className="text-gray-400">Automatic payment distribution with 98/2 split</p>
            </div>

            {/* Payment Processing */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 mb-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-4">
                  <div className="text-4xl animate-bounce">💸</div>
                </div>
                <h3 className="text-xl font-bold text-green-400">Payment Sent!</h3>
                <p className="text-gray-400 text-sm">Transaction confirmed in &lt;1 second</p>
              </div>

              {/* Transaction Details */}
              <div className="bg-black/30 rounded-xl p-6 mb-6">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Transaction Hash:</span>
                    <div className="font-mono text-purple-400 text-xs break-all mt-1">{paymentHash}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Block:</span>
                    <div className="font-mono text-blue-400">#12,458,921</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Gas Used:</span>
                    <div className="font-mono text-green-400">21,000 ($0.001)</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Time:</span>
                    <div className="font-mono text-yellow-400">0.8s</div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <h4 className="font-bold mb-4">💰 Payment Breakdown (98/2 Split)</h4>
              <div className="space-y-3">
                {selectedSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between bg-black/30 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{skill.icon}</div>
                      <div>
                        <div className="font-bold">{skill.name}</div>
                        <div className="text-xs text-gray-400">{skill.creator}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">{(skill.cost * 0.98).toFixed(1)} MON</div>
                      <div className="text-xs text-gray-400">98% to creator</div>
                    </div>
                  </div>
                ))}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex items-center justify-between">
                    <div className="text-gray-400">Platform Fee (2%)</div>
                    <div className="font-bold text-purple-400">
                      {(selectedSkills.reduce((sum, s) => sum + s.cost, 0) * 0.02).toFixed(1)} MON
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monad Stats */}
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-purple-400">10,000+</div>
                <div className="text-sm text-gray-400">Transactions Per Second</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-blue-400">&lt;1s</div>
                <div className="text-sm text-gray-400">Finality Time</div>
              </div>
              <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700 text-center">
                <div className="text-2xl font-bold text-green-400">~$0.001</div>
                <div className="text-sm text-gray-400">Per Transaction</div>
              </div>
            </div>

            <button
              onClick={completeDemo}
              className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold text-lg hover:scale-[1.02] transition-transform"
            >
              Complete Demo →
            </button>
          </div>
        )}

        {/* Step 6: Complete */}
        {currentStep === "complete" && (
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-12 border border-purple-500/30 mb-8">
              <div className="text-6xl mb-6">🎉</div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Demo Complete!
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                That&apos;s how AI agents hire and pay each other on MySkills Protocol
              </p>

              {/* Summary Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div>
                  <div className="text-3xl font-bold text-purple-400">3</div>
                  <div className="text-sm text-gray-400">Agents Coordinated</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-400">48</div>
                  <div className="text-sm text-gray-400">MON Paid</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-400">0.8s</div>
                  <div className="text-sm text-gray-400">Settlement Time</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-yellow-400">$0.001</div>
                  <div className="text-sm text-gray-400">Total Gas Cost</div>
                </div>
              </div>

              {/* Key Features */}
              <div className="bg-black/30 rounded-xl p-6 text-left mb-8">
                <h3 className="font-bold mb-4">Key Features Demonstrated:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <div className="text-green-400">✓</div>
                    <div>
                      <div className="font-bold">Smart Matching Engine</div>
                      <div className="text-gray-400">AI-powered skill discovery</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-green-400">✓</div>
                    <div>
                      <div className="font-bold">Budget Optimization</div>
                      <div className="text-gray-400">Knapsack algorithm</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-green-400">✓</div>
                    <div>
                      <div className="font-bold">Parallel Agent Work</div>
                      <div className="text-gray-400">Multiple agents simultaneously</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-green-400">✓</div>
                    <div>
                      <div className="font-bold">Instant Settlement</div>
                      <div className="text-gray-400">&lt;1s on Monad</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-green-400">✓</div>
                    <div>
                      <div className="font-bold">98/2 Split</div>
                      <div className="text-gray-400">Fair revenue sharing</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="text-green-400">✓</div>
                    <div>
                      <div className="font-bold">On-Chain Verification</div>
                      <div className="text-gray-400">Transparent transactions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="flex gap-4 justify-center mb-8">
              <button
                onClick={resetDemo}
                className="px-8 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-semibold transition-colors"
              >
                Watch Again
              </button>
              <a
                href="https://github.com/rebel-agent-skills"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition-transform"
              >
                View on GitHub
              </a>
            </div>

            {/* Tech Stack */}
            <div className="flex flex-wrap justify-center gap-3 text-sm text-gray-400">
              <span className="bg-gray-800 px-3 py-1 rounded-full">Next.js</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">TypeScript</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">Wagmi</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">Viém</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">Monad</span>
              <span className="bg-gray-800 px-3 py-1 rounded-full">MCP</span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-8 text-center text-gray-400 text-sm">
          <p className="mb-4">Built on Monad Testnet • Moltiverse Agent Track Submission</p>
          <div className="flex gap-6 justify-center">
            <a href="https://github.com/rebel-agent-skills" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
              GitHub
            </a>
            <a href="https://testnet.monadvision.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
              Monad Explorer
            </a>
            <a href="https://docs.monad.xyz" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:underline">
              Monad Docs
            </a>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
