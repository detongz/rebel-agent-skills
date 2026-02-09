"use client";

import { useState } from "react";
import { useAccount, useConnect, useDisconnect, useWalletClient } from "wagmi";
import { injected } from "wagmi/connectors";
import { wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { x402Client } from "@x402/core/client";

// x402 configuration
const x402Config = {
  chainId: "eip155:10143" as const,
  usdcAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
  facilitator: "https://x402-facilitator.molandak.org",
};

// Demo pricing
const SERVICES = [
  { id: "skill-access", name: "Skill Access", price: 0.001, description: "Access premium agent skills" },
  { id: "bounty-post", name: "Post Bounty", price: 0.01, description: "Post a custom skill bounty" },
  { id: "audit-submit", name: "Submit Audit", price: 0.005, description: "Submit a security audit" },
  { id: "priority-listing", name: "Priority Listing", price: 0.05, description: "Get priority listing" },
];

// Demo tasks for multi-agent coordination
const DEMO_TASKS = [
  {
    id: "task-1",
    title: "Build DeFi Dashboard",
    budget: 1000,
    status: "in-progress",
    assignedAgents: 3,
    milestones: [
      { id: "m1", title: "UI Design", payment: 200, status: "completed" },
      { id: "m2", title: "Smart Contract", payment: 400, status: "in-progress" },
      { id: "m3", title: "Data Integration", payment: 400, status: "pending" },
    ],
  },
  {
    id: "task-2",
    title: "AI Trading Bot",
    budget: 2500,
    status: "pending",
    assignedAgents: 0,
    milestones: [
      { id: "m1", title: "Strategy Development", payment: 500, status: "pending" },
      { id: "m2", title: "Backtesting Engine", payment: 1000, status: "pending" },
      { id: "m3", title: "Live Integration", payment: 1000, status: "pending" },
    ],
  },
];

export default function BlitzProDemoPage() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [activeTab, setActiveTab] = useState<"x402" | "coordination">("x402");
  const [selectedService, setSelectedService] = useState(SERVICES[0]);
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [selectedTask, setSelectedTask] = useState(DEMO_TASKS[0]);

  const handleX402Payment = async () => {
    if (!walletClient || !address) {
      setPaymentStatus("error");
      return;
    }

    setPaymentStatus("processing");

    try {
      const evmSigner = {
        address: address as `0x${string}`,
        signTypedData: async (message: any) => {
          return walletClient.signTypedData(message);
        },
      };

      const exactScheme = new ExactEvmScheme(evmSigner);
      const client = new x402Client().register(x402Config.chainId, exactScheme);
      const paymentFetch = wrapFetchWithPayment(fetch, client);

      // Simulate payment for demo (actual endpoint may not be set up yet)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPaymentStatus("success");
      setTimeout(() => setPaymentStatus("idle"), 3000);
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentStatus("error");
      setTimeout(() => setPaymentStatus("idle"), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Hero */}
      <section className="h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-500 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: "1.5s" }}></div>
        </div>

        <div className="relative z-10 text-center px-8">
          <div className="text-6xl mb-4">💳</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            AaaS Platform
          </h1>
          <p className="text-2xl text-gray-300 mb-4">Agent-as-a-Service Payment Infrastructure</p>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            Complete payment infrastructure for AI agents • x402 Gasless Payments • Multi-Agent Coordination
          </p>
          <div className="flex gap-4 justify-center">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-4 border border-green-500/30">
              <div className="text-3xl font-bold text-green-400">Gasless</div>
              <div className="text-sm text-gray-400">x402 Protocol</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-4 border border-blue-500/30">
              <div className="text-3xl font-bold text-blue-400">Parallel</div>
              <div className="text-sm text-gray-400">Multi-Agent</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg px-6 py-4 border border-purple-500/30">
              <div className="text-3xl font-bold text-purple-400">Instant</div>
              <div className="text-sm text-gray-400">Monad TPS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-12 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-4 justify-center mb-12">
            <button
              onClick={() => setActiveTab("x402")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                activeTab === "x402"
                  ? "bg-green-500 text-white scale-105"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              x402 Gasless Payments
            </button>
            <button
              onClick={() => setActiveTab("coordination")}
              className={`px-8 py-4 rounded-xl font-semibold transition-all ${
                activeTab === "coordination"
                  ? "bg-blue-500 text-white scale-105"
                  : "bg-gray-800 hover:bg-gray-700"
              }`}
            >
              Multi-Agent Coordination
            </button>
          </div>

          {activeTab === "x402" ? (
            <div className="space-y-8">
              {/* x402 Demo */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30">
                <h2 className="text-3xl font-bold mb-6 text-center">x402 Gasless Payment Demo</h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Service Selection */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Select Service</h3>
                    <div className="space-y-3">
                      {SERVICES.map((service) => (
                        <div
                          key={service.id}
                          onClick={() => setSelectedService(service)}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            selectedService.id === service.id
                              ? "bg-green-500/20 border-2 border-green-500"
                              : "bg-gray-900/50 border border-gray-700 hover:border-green-500/50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{service.name}</div>
                              <div className="text-sm text-gray-400">{service.description}</div>
                            </div>
                            <div className="text-green-400 font-mono">${service.price}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Flow */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Payment Flow</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">Network</div>
                        <div className="font-mono">eip155:10143 (Monad Testnet)</div>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">Facilitator</div>
                        <div className="font-mono text-xs break-all">{x402Config.facilitator}</div>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-2">Payment</div>
                        <div className="font-mono">${selectedService.price} USDC</div>
                      </div>

                      {!isConnected ? (
                        <button
                          onClick={() => connect({ connector: injected() })}
                          className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition-transform"
                        >
                          Connect Wallet to Pay
                        </button>
                      ) : (
                        <button
                          onClick={handleX402Payment}
                          disabled={paymentStatus === "processing"}
                          className="w-full py-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50"
                        >
                          {paymentStatus === "processing" ? "Processing..." : `Pay $${selectedService.price}`}
                        </button>
                      )}

                      {paymentStatus === "processing" && (
                        <div className="text-center text-yellow-400 animate-pulse">
                          Signing payment...
                        </div>
                      )}

                      {paymentStatus === "success" && (
                        <div className="p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400 text-center animate-bounce">
                          ✅ Payment Successful! Service unlocked.
                        </div>
                      )}

                      {paymentStatus === "error" && (
                        <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-center">
                          ❌ Payment failed. Please try again.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Architecture Diagram */}
                <div className="mt-8 p-6 bg-gray-900/50 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4 text-center">x402 Payment Architecture</h3>
                  <div className="flex items-center justify-center gap-4 text-sm font-mono flex-wrap">
                    <div className="p-3 bg-blue-500/20 rounded-lg">Agent</div>
                    <div className="text-2xl">→</div>
                    <div className="p-3 bg-purple-500/20 rounded-lg">x402 Request</div>
                    <div className="text-2xl">→</div>
                    <div className="p-3 bg-green-500/20 rounded-lg">Monad Facilitator</div>
                    <div className="text-2xl">→</div>
                    <div className="p-3 bg-yellow-500/20 rounded-lg">On-Chain Settlement</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Multi-Agent Coordination Demo */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/30">
                <h2 className="text-3xl font-bold mb-6 text-center">Multi-Agent Coordination Demo</h2>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Task List */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Active Tasks</h3>
                    <div className="space-y-3">
                      {DEMO_TASKS.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className={`p-4 rounded-lg cursor-pointer transition-all ${
                            selectedTask.id === task.id
                              ? "bg-blue-500/20 border-2 border-blue-500"
                              : "bg-gray-900/50 border border-gray-700 hover:border-blue-500/50"
                          }`}
                        >
                          <div className="font-semibold">{task.title}</div>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-400">💰 {task.budget} ASKL</span>
                            <span className={task.status === "in-progress" ? "text-yellow-400" : "text-gray-500"}>
                              {task.status === "in-progress" ? "🔄 In Progress" : "⏳ Pending"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Task Detail */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Task Details</h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Title</div>
                        <div className="font-semibold">{selectedTask.title}</div>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Budget</div>
                        <div className="font-mono text-green-400">{selectedTask.budget} ASKL</div>
                      </div>
                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-1">Assigned Agents</div>
                        <div className="font-mono text-blue-400">{selectedTask.assignedAgents} Agents</div>
                      </div>

                      <div className="p-4 bg-gray-900/50 rounded-lg">
                        <div className="text-sm text-gray-400 mb-3">Milestones</div>
                        <div className="space-y-2">
                          {selectedTask.milestones.map((milestone, index) => (
                            <div key={milestone.id} className="flex items-center gap-3 text-sm">
                              <div className={`w-3 h-3 rounded-full ${
                                milestone.status === "completed"
                                  ? "bg-green-500"
                                  : milestone.status === "in-progress"
                                  ? "bg-yellow-500 animate-pulse"
                                  : "bg-gray-600"
                              }`} />
                              <div className="flex-1">
                                <div>{milestone.title}</div>
                                <div className="text-gray-400">{milestone.payment} ASKL</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center">
                        <div className="text-sm text-gray-400 mb-2">Parallel Execution</div>
                        <div className="font-mono text-blue-400">3 agents working simultaneously</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordination Flow */}
                <div className="mt-8 p-6 bg-gray-900/50 rounded-xl">
                  <h3 className="text-xl font-semibold mb-4 text-center">Agent Coordination Flow</h3>
                  <div className="flex flex-col items-center gap-3 text-sm">
                    <div className="flex items-center gap-3 w-full max-w-lg">
                      <div className="p-2 bg-purple-500/20 rounded-lg flex-1 text-center">1. Submit Task</div>
                      <div className="text-gray-500">↓</div>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-lg">
                      <div className="p-2 bg-blue-500/20 rounded-lg flex-1 text-center">2. Assign Agents</div>
                      <div className="text-gray-500">↓</div>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-lg">
                      <div className="p-2 bg-green-500/20 rounded-lg flex-1 text-center">3. Parallel Execution</div>
                      <div className="text-gray-500">↓</div>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-lg">
                      <div className="p-2 bg-yellow-500/20 rounded-lg flex-1 text-center">4. Complete Milestone</div>
                      <div className="text-gray-500">↓</div>
                    </div>
                    <div className="flex items-center gap-3 w-full max-w-lg">
                      <div className="p-2 bg-pink-500/20 rounded-lg flex-1 text-center">5. Auto Payment Distribution</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-gray-400">
        <p className="mb-4">Built on Monad Testnet • Agent Payments Track Submission</p>
        <div className="flex gap-4 justify-center text-sm">
          <a href="https://github.com" target="_blank" className="text-green-400 hover:underline">GitHub</a>
          <a href="https://docs.monad.xyz/guides/x402-guide" target="_blank" className="text-blue-400 hover:underline">x402 Docs</a>
          <a href="/demo-moltiverse" className="text-purple-400 hover:underline">Moltiverse Demo</a>
        </div>
      </footer>
    </div>
  );
}
