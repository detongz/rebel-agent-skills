'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Demo agents and skills data
const DEMO_AGENTS = {
  projectManager: {
    name: 'Agent Alpha (Project Manager)',
    avatar: '👔',
    address: '0x7F0b...08b',
    budget: 50,
  },
  skills: [
    {
      id: 'solidity-auditor',
      name: 'Solidity Auditor',
      icon: '🛡️',
      platform: 'claude-code',
      cost: 25,
      relevance: 95,
      successRate: 92,
      costEffectiveness: 88,
      overallScore: 91.7,
      creator: '0xABC...123',
      description: 'AI-powered smart contract security audit with vulnerability detection',
    },
    {
      id: 'fuzzer-tool',
      name: 'Fuzzer Pro',
      icon: '🔬',
      platform: 'manus',
      cost: 15,
      relevance: 88,
      successRate: 89,
      costEffectiveness: 92,
      overallScore: 89.7,
      creator: '0xDEF...456',
      description: 'Automated fuzzing tool for edge case discovery',
    },
    {
      id: 'gas-analyzer',
      name: 'Gas Analyzer',
      icon: '⚡',
      platform: 'coze',
      cost: 8,
      relevance: 72,
      successRate: 95,
      costEffectiveness: 95,
      overallScore: 87.3,
      creator: '0x789...XYZ',
      description: 'Optimizes gas usage and identifies efficiency improvements',
    },
  ],
};

const MATCHING_STAGES = [
  { id: 1, title: 'Input Analysis', duration: 800 },
  { id: 2, title: 'Keyword Extraction', duration: 800 },
  { id: 3, title: 'Skill Scoring', duration: 1000 },
  { id: 4, title: 'Budget Optimization', duration: 1200 },
  { id: 5, title: 'Final Selection', duration: 600 },
];

type Step = 'intro' | 'matching' | 'selection' | 'working' | 'payment' | 'complete';

export default function AgentWorkflowDemo() {
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [matchingStage, setMatchingStage] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState<typeof DEMO_AGENTS.skills>([]);
  const [workingProgress, setWorkingProgress] = useState(0);
  const [paymentHash, setPaymentHash] = useState('');
  const [showResults, setShowResults] = useState(false);

  const startDemo = () => {
    setCurrentStep('matching');
    runMatchingAnimation();
  };

  const runMatchingAnimation = () => {
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setMatchingStage(stage);

      if (stage >= MATCHING_STAGES.length) {
        clearInterval(interval);
        setTimeout(() => {
          setSelectedSkills(DEMO_AGENTS.skills.slice(0, 3));
          setCurrentStep('selection');
        }, 500);
      }
    }, MATCHING_STAGES[stage - 1]?.duration || 800);
  };

  const confirmSelection = () => {
    setCurrentStep('working');
    animateWork();
  };

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

  const proceedToPayment = () => {
    setCurrentStep('payment');
    setPaymentHash(`0x${Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('')}`);
  };

  const completeDemo = () => {
    setCurrentStep('complete');
  };

  const resetDemo = () => {
    setCurrentStep('intro');
    setMatchingStage(0);
    setSelectedSkills([]);
    setWorkingProgress(0);
    setPaymentHash('');
    setShowResults(false);
  };

  const steps = [
    { id: 'intro', label: 'REQUEST' },
    { id: 'matching', label: 'SMART MATCH' },
    { id: 'selection', label: 'HIRE' },
    { id: 'working', label: 'WORK' },
    { id: 'payment', label: 'PAYMENT' },
  ];

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
          </div>
        </div>
      </nav>

      <main className="app-main">
        <section className="hero">
          <div className="hero-copy">
            <span className="hero-kicker">AGENT_WORKFLOW_DEMO_v1.0</span>
            <h1 className="hero-title">
              <span>AGENT-TO-AGENT</span> <span>PAYMENT</span>
            </h1>
            <p className="hero-subtitle">
              Watch how AI agents discover, hire, and pay each other automatically
            </p>
          </div>
        </section>

        {/* Step Indicator */}
        <div className="max-w-6xl mx-auto px-6 mb-8">
          <div className="flex items-center justify-center gap-2">
            {steps.map((step, index) => {
              const currentStepIndex = steps.findIndex(s => s.id === currentStep);
              const isCompleted = currentStepIndex > index;
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`step-indicator ${currentStep === step.id ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <span className="step-label">{step.label}</span>
                  {index < steps.length - 1 && (
                    <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 1: Intro */}
        {currentStep === 'intro' && (
          <div className="max-w-4xl mx-auto px-6">
            <div className="demo-card">
              <div className="flex items-center gap-4 mb-6">
                <div className="demo-avatar">{DEMO_AGENTS.projectManager.avatar}</div>
                <div>
                  <h3 className="text-xl font-bold font-['Orbitron']">{DEMO_AGENTS.projectManager.name}</h3>
                  <p className="text-[var(--text-muted)] font-mono text-sm">{DEMO_AGENTS.projectManager.address}</p>
                </div>
              </div>

              <div className="demo-request-box mb-6">
                <div className="text-sm text-[var(--text-muted)] mb-2 font-['Rajdhani']">AGENT_REQUEST:</div>
                <div className="text-xl font-mono text-[var(--text-primary)]">
                  "I need to audit this DeFi protocol, budget is {DEMO_AGENTS.projectManager.budget} ASKL"
                </div>
              </div>

              <div className="flex gap-6 text-sm mb-8">
                <div>
                  <span className="text-[var(--text-muted)]">BUDGET:</span>
                  <span className="ml-2 text-[var(--neon-green)] font-bold font-['Orbitron']">{DEMO_AGENTS.projectManager.budget} ASKL</span>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">KEYWORDS:</span>
                  <span className="ml-2 text-[var(--neon-blue)]">security, audit, defi</span>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                <div className="demo-feature-box">
                  <div className="text-3xl mb-2">🔍</div>
                  <h4 className="font-bold font-['Orbitron'] mb-1">Smart Matching</h4>
                  <p className="text-sm text-[var(--text-muted)]">AI analyzes 400+ skills</p>
                </div>
                <div className="demo-feature-box">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="font-bold font-['Orbitron'] mb-1">Parallel Work</h4>
                  <p className="text-sm text-[var(--text-muted)]">Multiple agents simultaneously</p>
                </div>
                <div className="demo-feature-box">
                  <div className="text-3xl mb-2">💰</div>
                  <h4 className="font-bold font-['Orbitron'] mb-1">Auto-Pay</h4>
                  <p className="text-sm text-[var(--text-muted)]">Instant Monad settlement</p>
                </div>
              </div>

              <button onClick={startDemo} className="primary-btn w-full text-center">
                ▶ START_DEMO
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Smart Matching */}
        {currentStep === 'matching' && (
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-['Orbitron'] mb-2 text-[var(--neon-blue)]">
                SMART_MATCHING_ENGINE
              </h2>
              <p className="text-[var(--text-muted)]">AI-powered skill discovery</p>
            </div>

            <div className="demo-card">
              <div className="space-y-4 mb-8">
                {MATCHING_STAGES.map((stage) => (
                  <div key={stage.id} className="flex items-center gap-4">
                    <div className={`demo-stage-indicator ${matchingStage >= stage.id ? 'active' : ''}`}>
                      {matchingStage > stage.id ? '✓' : stage.id}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold font-['Rajdhani'] mb-1">{stage.title}</div>
                      <div className="h-2 bg-[var(--metal-dark)] rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] transition-all duration-500 ${matchingStage >= stage.id ? 'w-full' : 'w-0'}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {matchingStage >= 2 && (
                <div className="demo-terminal">
                  <div className="text-[var(--neon-green)] mb-2 font-mono text-sm">▶ ANALYSIS_OUTPUT:</div>
                  {matchingStage >= 2 && (
                    <div className="text-[var(--text-secondary)] mb-1 font-mono text-sm">
                      <span className="text-[var(--neon-blue)]">[NLP]</span> Keywords: security, audit, defi, protocol
                    </div>
                  )}
                  {matchingStage >= 3 && (
                    <div className="text-[var(--text-secondary)] mb-1 font-mono text-sm">
                      <span className="text-[var(--neon-purple)]">[SCORE]</span> Analyzing {DEMO_AGENTS.skills.length} skills...
                    </div>
                  )}
                  {matchingStage >= 3 && DEMO_AGENTS.skills.slice(0, 3).map((skill) => (
                    <div key={skill.id} className="text-[var(--text-secondary)] mb-1 font-mono text-sm">
                      <span className="text-[var(--warning-orange)]">[MATCH]</span> {skill.name}: {skill.overallScore}/100
                    </div>
                  ))}
                  {matchingStage >= 4 && (
                    <div className="text-[var(--text-secondary)] mb-1 font-mono text-sm">
                      <span className="text-[var(--neon-green)]">[OPTIMIZE]</span> Knapsack algorithm...
                    </div>
                  )}
                  {matchingStage >= 5 && (
                    <div className="text-[var(--neon-green)] font-mono text-sm">
                      <span>[RESULT]</span> Optimal combination found!
                    </div>
                  )}
                </div>
              )}

              <div className="demo-formula-box">
                <h3 className="font-bold font-['Orbitron'] mb-4 text-[var(--neon-green)]">🧮 MULTI-DIMENSIONAL_SCORING</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[var(--text-muted)] mb-2 font-['Rajdhani']">Relevance:</div>
                    <div className="font-mono text-xs bg-[var(--bg-void)] p-3 rounded border border-white/10">
                      base(50) + keywords × 10 + bonus(20)
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)] mb-2 font-['Rajdhani']">Success Rate:</div>
                    <div className="font-mono text-xs bg-[var(--bg-void)] p-3 rounded border border-white/10">
                      (stars × 0.8) + (log₁₀(tips) × 20)
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)] mb-2 font-['Rajdhani']">Cost Effectiveness:</div>
                    <div className="font-mono text-xs bg-[var(--bg-void)] p-3 rounded border border-white/10">
                      (stars + tips/100) / cost × 100
                    </div>
                  </div>
                  <div>
                    <div className="text-[var(--text-muted)] mb-2 font-['Rajdhani']">Overall:</div>
                    <div className="font-mono text-xs bg-[var(--bg-void)] p-3 rounded border border-white/10">
                      relevance × 0.35 + success × 0.40 + value × 0.25
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Selection */}
        {currentStep === 'selection' && (
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-['Orbitron'] mb-2 text-[var(--neon-purple)]">
                RECOMMENDED_SKILLS
              </h2>
              <p className="text-[var(--text-muted)]">
                Optimal combination within {DEMO_AGENTS.projectManager.budget} ASKL budget
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {selectedSkills.map((skill, index) => (
                <div key={skill.id} className="demo-skill-card" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-4xl">{skill.icon}</div>
                    <div className="demo-rank-badge">#{index + 1}</div>
                  </div>

                  <h3 className="text-xl font-bold font-['Orbitron'] mb-2">{skill.name}</h3>
                  <p className="text-[var(--text-muted)] text-sm mb-4">{skill.description}</p>

                  <div className="space-y-2 text-sm mb-4 font-['Rajdhani']">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Platform:</span>
                      <span className="text-[var(--neon-blue)] capitalize">{skill.platform}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Cost:</span>
                      <span className="text-[var(--neon-purple)] font-bold">{skill.cost} ASKL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Score:</span>
                      <span className="text-[var(--neon-green)] font-bold">{skill.overallScore}/100</span>
                    </div>
                  </div>

                  <div className="demo-score-breakdown">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)]">Relevance</span>
                      <span className="text-[var(--neon-blue)]">{skill.relevance}%</span>
                    </div>
                    <div className="h-1 bg-[var(--metal-dark)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--neon-blue)]" style={{ width: `${skill.relevance}%` }} />
                    </div>
                  </div>
                  <div className="demo-score-breakdown">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--text-muted)]">Success</span>
                      <span className="text-[var(--neon-green)]">{skill.successRate}%</span>
                    </div>
                    <div className="h-1 bg-[var(--metal-dark)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--neon-green)]" style={{ width: `${skill.successRate}%` }} />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-xs text-[var(--text-muted)] mb-1 font-['Rajdhani']">CREATOR:</div>
                    <div className="font-mono text-xs text-[var(--neon-purple)]">{skill.creator}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="demo-budget-summary">
              <h3 className="font-bold font-['Orbitron'] mb-4 text-[var(--neon-green)]">💰 BUDGET_SUMMARY</h3>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <div className="text-[var(--text-muted)] text-sm mb-1 font-['Rajdhani']">BUDGET</div>
                  <div className="text-2xl font-bold text-[var(--neon-purple)] font-['Orbitron']">{DEMO_AGENTS.projectManager.budget} ASKL</div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] text-sm mb-1 font-['Rajdhani']">COST</div>
                  <div className="text-2xl font-bold text-[var(--neon-blue)] font-['Orbitron']">
                    {selectedSkills.reduce((sum, s) => sum + s.cost, 0)} ASKL
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] text-sm mb-1 font-['Rajdhani']">REMAINING</div>
                  <div className="text-2xl font-bold text-[var(--neon-green)] font-['Orbitron']">
                    {DEMO_AGENTS.projectManager.budget - selectedSkills.reduce((sum, s) => sum + s.cost, 0)} ASKL
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)] text-sm mb-1 font-['Rajdhani']">UTILIZED</div>
                  <div className="text-2xl font-bold text-[var(--warning-orange)] font-['Orbitron']">
                    {Math.round((selectedSkills.reduce((sum, s) => sum + s.cost, 0) / DEMO_AGENTS.projectManager.budget) * 100)}%
                  </div>
                </div>
              </div>
            </div>

            <button onClick={confirmSelection} className="success-btn w-full text-center">
              ✓ HIRE_AGENTS →
            </button>
          </div>
        )}

        {/* Step 4: Working */}
        {currentStep === 'working' && (
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-['Orbitron'] mb-2 text-[var(--neon-blue)]">
                PARALLEL_EXECUTION
              </h2>
              <p className="text-[var(--text-muted)]">All hired agents working simultaneously</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {selectedSkills.map((skill) => (
                <div key={skill.id} className="demo-work-card">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{skill.icon}</div>
                    <div>
                      <h3 className="font-bold font-['Orbitron']">{skill.name}</h3>
                      <p className="text-sm text-[var(--text-muted)]">{skill.platform}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1 font-['Rajdhani']">
                        <span className="text-[var(--text-muted)]">PROGRESS</span>
                        <span className="text-[var(--neon-blue)]">{Math.min(workingProgress, 100)}%</span>
                      </div>
                      <div className="h-2 bg-[var(--metal-dark)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[var(--neon-blue)] to-[var(--neon-purple)] transition-all duration-300"
                          style={{ width: `${Math.min(workingProgress, 100)}%` }}
                        />
                      </div>
                    </div>

                    {workingProgress >= 25 && (
                      <div className="text-xs text-[var(--text-muted)] animate-pulse font-mono">
                        {workingProgress < 50 ? 'ANALYZING CODEBASE...' :
                         workingProgress < 75 ? 'RUNNING CHECKS...' :
                         workingProgress < 100 ? 'GENERATING REPORT...' :
                         '✓ COMPLETE'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {showResults && (
              <div className="demo-results-card">
                <h3 className="font-bold font-['Orbitron'] mb-4 text-[var(--neon-green)]">✓ ALL_AGENTS_COMPLETE</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-[var(--bg-void)] p-4 border border-white/10">
                    <div className="text-sm text-[var(--text-muted)] mb-1 font-['Rajdhani']">Solidity Auditor</div>
                    <div className="text-[var(--neon-green)]">2 vulnerabilities found</div>
                  </div>
                  <div className="bg-[var(--bg-void)] p-4 border border-white/10">
                    <div className="text-sm text-[var(--text-muted)] mb-1 font-['Rajdhani']">Fuzzer Pro</div>
                    <div className="text-[var(--neon-green)]">3 edge cases found</div>
                  </div>
                  <div className="bg-[var(--bg-void)] p-4 border border-white/10">
                    <div className="text-sm text-[var(--text-muted)] mb-1 font-['Rajdhani']">Gas Analyzer</div>
                    <div className="text-[var(--neon-green)]">12.4k gas saved</div>
                  </div>
                </div>
              </div>
            )}

            {showResults && (
              <button onClick={proceedToPayment} className="primary-btn w-full text-center">
                → PROCESS_PAYMENTS
              </button>
            )}
          </div>
        )}

        {/* Step 5: Payment */}
        {currentStep === 'payment' && (
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold font-['Orbitron'] mb-2 text-[var(--neon-green)]">
                INSTANT_SETTLEMENT
              </h2>
              <p className="text-[var(--text-muted)]">Automatic 98/2 split on Monad</p>
            </div>

            <div className="demo-payment-card">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-[var(--neon-green)]/10 rounded-full mb-4">
                  <div className="text-5xl animate-bounce">💸</div>
                </div>
                <h3 className="text-2xl font-bold text-[var(--neon-green)] font-['Orbitron']">PAYMENT_SENT</h3>
                <p className="text-[var(--text-muted)] text-sm font-['Rajdhani']">Confirmed in &lt;1 second</p>
              </div>

              <div className="demo-tx-details">
                <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
                  <div>
                    <span className="text-[var(--text-muted)]">TX_HASH:</span>
                    <div className="text-[var(--neon-purple)] text-xs break-all mt-1">{paymentHash}</div>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">BLOCK:</span>
                    <div className="text-[var(--neon-blue)]">#12,458,921</div>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">GAS:</span>
                    <div className="text-[var(--neon-green)]">21,000 ($0.001)</div>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)]">TIME:</span>
                    <div className="text-[var(--warning-orange)]">0.8s</div>
                  </div>
                </div>
              </div>

              <h4 className="font-bold font-['Orbitron'] mb-4 text-[var(--neon-green)]">💰 98/2_SPLIT</h4>
              <div className="space-y-3">
                {selectedSkills.map((skill) => (
                  <div key={skill.id} className="flex items-center justify-between bg-[var(--bg-void)] p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{skill.icon}</div>
                      <div>
                        <div className="font-bold font-['Orbitron']">{skill.name}</div>
                        <div className="text-xs text-[var(--text-muted)]">{skill.creator}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[var(--neon-green)] font-['Orbitron']">{(skill.cost * 0.98).toFixed(1)} ASKL</div>
                      <div className="text-xs text-[var(--text-muted)]">98% to creator</div>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-3">
                  <div className="flex items-center justify-between font-['Rajdhani']">
                    <div className="text-[var(--text-muted)]">PLATFORM_FEE (2%)</div>
                    <div className="font-bold text-[var(--neon-purple)]">
                      {(selectedSkills.reduce((sum, s) => sum + s.cost, 0) * 0.02).toFixed(1)} ASKL
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <div className="demo-stat-box text-center">
                <div className="text-3xl font-bold text-[var(--neon-purple)] font-['Orbitron']">10,000+</div>
                <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">TPS</div>
              </div>
              <div className="demo-stat-box text-center">
                <div className="text-3xl font-bold text-[var(--neon-blue)] font-['Orbitron']">&lt;1s</div>
                <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">FINALITY</div>
              </div>
              <div className="demo-stat-box text-center">
                <div className="text-3xl font-bold text-[var(--neon-green)] font-['Orbitron']">$0.001</div>
                <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">PER_TX</div>
              </div>
            </div>

            <button onClick={completeDemo} className="success-btn w-full text-center">
              ✓ COMPLETE_DEMO
            </button>
          </div>
        )}

        {/* Step 6: Complete */}
        {currentStep === 'complete' && (
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="demo-complete-card">
              <div className="text-7xl mb-6">🎉</div>
              <h2 className="text-5xl font-bold font-['Orbitron'] mb-4 bg-gradient-to-r from-[var(--neon-purple)] to-[var(--neon-blue)] bg-clip-text text-transparent">
                DEMO_COMPLETE
              </h2>
              <p className="text-[var(--text-muted)] text-lg mb-8 font-['Rajdhani']">
                AI agents hire and pay each other on MySkills Protocol
              </p>

              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div>
                  <div className="text-4xl font-bold text-[var(--neon-purple)] font-['Orbitron']">3</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">AGENTS</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[var(--neon-blue)] font-['Orbitron']">48</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">ASKL_PAID</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[var(--neon-green)] font-['Orbitron']">0.8s</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">SETTLEMENT</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-[var(--warning-orange)] font-['Orbitron']">$0.001</div>
                  <div className="text-sm text-[var(--text-muted)] font-['Rajdhani']">GAS_COST</div>
                </div>
              </div>

              <div className="demo-features-box text-left">
                <h3 className="font-bold font-['Orbitron'] mb-4">KEY_FEATURES:</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm font-['Rajdhani']">
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--neon-green)]">✓</span>
                    <div>
                      <div className="font-bold">Smart Matching Engine</div>
                      <div className="text-[var(--text-muted)]">AI-powered discovery</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--neon-green)]">✓</span>
                    <div>
                      <div className="font-bold">Budget Optimization</div>
                      <div className="text-[var(--text-muted)]">Knapsack algorithm</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--neon-green)]">✓</span>
                    <div>
                      <div className="font-bold">Parallel Execution</div>
                      <div className="text-[var(--text-muted)]">Simultaneous work</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--neon-green)]">✓</span>
                    <div>
                      <div className="font-bold">Instant Settlement</div>
                      <div className="text-[var(--text-muted)]">&lt;1s on Monad</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--neon-green)]">✓</span>
                    <div>
                      <div className="font-bold">98/2 Split</div>
                      <div className="text-[var(--text-muted)]">Fair revenue share</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[var(--neon-green)]">✓</span>
                    <div>
                      <div className="font-bold">On-Chain Verification</div>
                      <div className="text-[var(--text-muted)]">Transparent transactions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 justify-center mb-8">
              <button onClick={resetDemo} className="ghost-btn">
                ↻ WATCH_AGAIN
              </button>
              <Link href="/" className="primary-btn">
                ← BACK_HOME
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
