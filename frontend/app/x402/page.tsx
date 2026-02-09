"use client";

import { useState } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { x402Client } from "@x402/core/client";

// x402 configuration
const x402Config = {
  chainId: "eip155:10143" as const,
  usdcAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3",
  facilitator: "https://x402-facilitator.molandak.org",
};

export default function X402DemoPage() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("Pay $0.001 USDC to unlock premium skill access");

  const handlePayment = async (service: string, price: string) => {
    if (!walletClient || !address) {
      setStatus("error");
      setMessage("Please connect your wallet first");
      return;
    }

    setStatus("loading");
    setMessage(`Processing payment for ${service}...`);

    try {
      // Create EVM signer compatible with x402
      const evmSigner = {
        address: address as `0x${string}`,
        signTypedData: async (message: {
          domain: Record<string, unknown>;
          types: Record<string, unknown>;
          primaryType: string;
          message: Record<string, unknown>;
        }) => {
          return walletClient.signTypedData({
            domain: message.domain as Parameters<typeof walletClient.signTypedData>[0]["domain"],
            types: message.types as Parameters<typeof walletClient.signTypedData>[0]["types"],
            primaryType: message.primaryType,
            message: message.message,
          });
        },
      };

      const exactScheme = new ExactEvmScheme(evmSigner);
      const client = new x402Client().register(x402Config.chainId, exactScheme);

      // Wrap fetch with x402 payment capability
      const paymentFetch = wrapFetchWithPayment(fetch, client);

      // Make payment request
      const response = await paymentFetch(`/api/x402/pay/${service}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error(`Payment failed: ${response.status}`);
      }

      const data = await response.json();

      setStatus("success");
      setMessage(`✅ Successfully unlocked ${service}!`);
      console.log("Payment result:", data);
    } catch (error) {
      console.error("Payment error:", error);
      setStatus("error");
      setMessage(`❌ Payment failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">x402 Payment Demo</h1>
        <p className="text-zinc-400 mb-8">
          Agent-native micropayments on Monad testnet using x402 protocol
        </p>

        <div className="bg-zinc-900 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-2 text-sm font-mono">
            <p>Network: {x402Config.chainId}</p>
            <p>Facilitator: {x402Config.facilitator}</p>
            <p>USDC: {x402Config.usdcAddress}</p>
          </div>
        </div>

        {isConnected ? (
          <div className="space-y-4">
            <div className="bg-zinc-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">
                Available Services
              </h2>
              <div className="space-y-3">
                <ServiceCard
                  name="Skill Access"
                  description="Access premium agent skills"
                  price="$0.001"
                  onPay={() => handlePayment("skill-access", "0.001")}
                />
                <ServiceCard
                  name="Post Bounty"
                  description="Post a custom skill bounty"
                  price="$0.01"
                  onPay={() => handlePayment("bounty-post", "0.01")}
                />
                <ServiceCard
                  name="Submit Audit"
                  description="Submit a security audit"
                  price="$0.005"
                  onPay={() => handlePayment("audit-submit", "0.005")}
                />
                <ServiceCard
                  name="Priority Listing"
                  description="Get priority listing in marketplace"
                  price="$0.05"
                  onPay={() => handlePayment("priority-listing", "0.05")}
                />
              </div>
            </div>

            {status !== "idle" && (
              <div className={`p-6 rounded-lg ${
                status === "error" ? "bg-red-950 text-red-300" :
                status === "success" ? "bg-green-950 text-green-300" :
                "bg-zinc-900 text-zinc-300"
              }`}>
                {status === "loading" && <div className="animate-pulse">Processing payment...</div>}
                {status === "success" && <div>{message}</div>}
                {status === "error" && <div>{message}</div>}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900 rounded-lg p-12 text-center">
            <p className="text-zinc-400 mb-4">Connect your wallet to make payments</p>
            <button className="px-6 py-3 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors">
              Connect Wallet
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ServiceCard({
  name,
  description,
  price,
  onPay,
}: {
  name: string;
  description: string;
  price: string;
  onPay: () => void;
}) {
  return (
    <div className="bg-zinc-800 rounded-lg p-4 flex items-center justify-between">
      <div>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-zinc-400">{description}</p>
      </div>
      <button
        onClick={onPay}
        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors"
      >
        Pay {price}
      </button>
    </div>
  );
}
