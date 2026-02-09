# Document 15

Source: https://docs.monad.xyz/guides/x402-guide

Skip to main content
Monad
Developer Discord
Search
⌘
K
Introduction
Developer Essentials
Guides
Add Monad to Wallet
Deploy a Contract
Verify a Contract
Use an Indexer
Build a basic dApp with Scaffold-ETH
Build a donation blink
Connect a wallet to your app with Reown AppKit
Build an MCP server that can interact with Monad Testnet
x402 on Monad
ERC-8004 on Monad
Build a portfolio viewer using Moralis API
Add swaps using Kuru Flow
Accelerate your app with Execution Events
Use deep links in a mobile app
EVM Resources
Templates
Monad Architecture
Tooling and Infrastructure
RPC Reference
Execution Events
Node Operations
FAQ
Official Links
Guidesx402 on Monad
How to set up an x402-enabled endpoint with Monad support

This guide shows how to set up payable endpoints using x402 payments and Monad's facilitator. It works on Monad testnet/mainnet.

What is x402?​

x402 is the HTTP 402 "Payment Required" status code reborn as a minimal protocol for internet‑native micropayments.

Instead of subscriptions or paywalls that require accounts, x402 lets any HTTP endpoint become instantly payable:

Client requests a resource
Server responds 402 with a small JSON payment requirement
Client pays with a signed transaction
Server verifies and serves the content
Beyond legacy limitations​

x402 is designed for a modern internet economy, solving key limitations of legacy systems:

Reduce fees and friction: Direct onchain payments without intermediaries, high fees, or manual setup.
Micropayments & usage-based billing: Charge per call or feature with simple, programmable pay-as-you-go flows.
Machine-to-machine transactions: Let AI agents pay and access services autonomously with no keys or human input needed.
Why x402 on Monad?​

Monad is a fully EVM‑compatible Layer 1 with:

10,000 TPS
~0.4s block times
Single‑slot finality
Parallel execution
Extremely low fees

These properties make Monad an ideal environment for true micropayments and agent-to-agent commerce. Payments settle instantly at low cost and avoid mempool congestion, perfect when many AI agents pay per API call.

Core Flow (Direct Payment)​
Facilitator Flow (Recommended for Production)​

A facilitator service is optional but recommended in production. Facilitators can batch transactions, cover gas, handle refunds, and simplify client logic.

Building an x402-based app using Monad x402 facilitator​
Prerequisites​
Node.js 18+
An EVM wallet
Access to Monad testnet funds (USDC test tokens below)
NOTE

Monad Facilitator only supports x402 version 2 and above.

Migration guide that explains the differences: https://docs.x402.org/guides/migration-v1-to-v2

How to get USDC tokens on Monad testnet
Step 1: Initialize a Next.js App​

Create a new Next.js project:

npx create-next-app@latest my-x402-app

When prompted, select the following options:

✅ TypeScript
✅ ESLint
✅ Tailwind CSS
✅ src/ directory
✅ App Router
✅ Customize default import alias: @/* (default)

Navigate to your project:

cd my-x402-app

Install the x402 packages:

NOTE

Install x402 packages with version 2.2.0 and above.

npm install @x402/core @x402/evm @x402/fetch @x402/next

Create a .env.local file for your environment variables:

touch .env.local
Step 2: Create a payTo address​

A payTo address is used to receive payments and interact with the blockchain from your backend.

Copy the wallet address and add it to your .env.local file as PAY_TO_ADDRESS

PAY_TO_ADDRESS=0xYourWallet
Step 4: Create a server side payable endpoint​
route.ts
src > app > api > premium
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
import { NextResponse } from "next/server";
import { withX402, type RouteConfig } from "@x402/next";
import { x402ResourceServer, HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import type { Network } from "@x402/core/types";
import { fullArticle } from "@/content/article";


// Monad Testnet configuration
const MONAD_NETWORK: Network = "eip155:10143";
const MONAD_USDC_TESTNET = "0x534b2f3A21130d7a60830c2Df862319e593943A3";


// Monad Facilitator URL
const FACILITATOR_URL = "https://x402-facilitator.molandak.org"; 


if (!process.env.PAY_TO_ADDRESS) {
  throw new Error("PAY_TO_ADDRESS environment variable is required");
}
const PAY_TO = process.env.PAY_TO_ADDRESS;


// Create facilitator client for Monad
const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });


// Create and configure x402 resource server
const server = new x402ResourceServer(facilitatorClient);


// Create Exact EVM Scheme with custom money parser for Monad USDC
const monadScheme = new ExactEvmScheme();
monadScheme.registerMoneyParser(async (amount: number, network: string) => {
  if (network === MONAD_NETWORK) {
    // Convert decimal amount to USDC smallest units (6 decimals)
    const tokenAmount = Math.floor(amount * 1_000_000).toString();
    return {
      amount: tokenAmount,
      asset: MONAD_USDC_TESTNET, // Raw address for EIP-712 verifyingContract
      extra: {
        name: "USDC",
        version: "2",
      },
    };
  }
  return null; // Use default parser for other networks
});


// Register Monad network with custom scheme
server.register(MONAD_NETWORK, monadScheme);


// Route configuration
const routeConfig: RouteConfig = {
  accepts: {
    scheme: "exact",
    network: MONAD_NETWORK,
    payTo: PAY_TO,
    price: "$0.001",
  },
  resource: "http://localhost:3000/api/premium", // Use relative path to avoid host mismatch
};


// Handler that returns full article content
async function handler(request: NextRequest) {
  return NextResponse.json({
    content: "Return premium content",
    unlockedAt: new Date().toISOString(),
  });
}


// Export GET method wrapped with x402 payment protection
export const GET = withX402(handler, routeConfig, server);
Step 5: Client-side setup (consuming paid endpoint)​

Below is an example of consuming the paid endpoint using a Next.js app, however the endpoint can be consumed via an agent script as well.

page.tsx
src > app
1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19
20
21
22
23
24
25
26
27
28
29
30
31
32
33
34
35
36
37
38
39
40
41
42
43
44
45
46
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152
153
154
155
156
157
158
159
160
161
162
163
164
165
166
167
168
169
170
171
172
173
174
175
176
177
178
179
180
"use client";


import { useState, useCallback, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm";
import { x402Client } from "@x402/core/client";


// x402 configuration
const x402Config = {
  chainId: "eip155:10143" as const,
  usdcAddress: "0x534b2f3A21130d7a60830c2Df862319e593943A3", // MONAD USDC TESTNET
  facilitator: "https://x402-facilitator.molandak.org", // MONAD FACILITATOR URL
  price: "0.001", // USDC
};


export default function Home() {
  const { isConnected, address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [message, setMessage] = useState("Pay $0.001 USDC to unlock premium content");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");


  // This function allows signing a message, and pay USDC gaslessly. 
  const handleUnlock = useCallback(async () => {
    if (!walletClient || !address) {
      setError("Please connect your wallet first");
      return;
    }


    setIsLoading(true);
    setError(null);


    try {
      // Create EVM signer compatible with x402 ClientEvmSigner interface
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


      // Create the Exact EVM scheme for signing
      const exactScheme = new ExactEvmScheme(evmSigner);


      // Create x402 client and register the scheme
      const client = new x402Client()
        .register(x402Config.chainId, exactScheme);


      console.log("x402 client configured for network:", x402Config.chainId);


      // Wrap fetch with x402 payment capability
      const paymentFetch = wrapFetchWithPayment(fetch, client);


      console.log("Making payment request to /api/article...");


      // Make request to protected endpoint
      const response = await paymentFetch("/api/premium", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });


      if (!response.ok) {
        // Try to parse x402 payment-required header for detailed error
        const paymentHeader = response.headers.get("payment-required") ||
                              response.headers.get("x-payment");


        if (paymentHeader && response.status === 402) {
          try {
            const paymentData = JSON.parse(atob(paymentHeader));
            console.error("Payment error details:", paymentData);


            // Extract user-friendly error message
            if (paymentData.error?.includes("insufficient_funds")) {
              throw new Error("INSUFFICIENT_FUNDS");
            }
            if (paymentData.error?.includes("unexpected_error")) {
              throw new Error("UNEXPECTED_ERROR");
            }
            if (paymentData.error) {
              throw new Error(paymentData.error);
            }
          } catch (e) {
            if (e instanceof Error && e.message === "INSUFFICIENT_FUNDS") {
              throw e;
            }
            // Failed to parse header, continue to generic error
          }
        }


        const errorText = await response.text().catch(() => "");
        let errorData: Record<string, unknown> = {};
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // Not JSON
        }
        throw new Error(
          errorData.error as string ||
          errorData.details as string ||
          `Request failed: ${response.status}`
        );
      }


      const data = await response.json();


      // Cache the unlocked content in LocalStorage
      localStorage.setItem(
        "premimum_content_unlocked",
        JSON.stringify({
          content: data.content,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Unlock error:", err);
      const message = err instanceof Error ? err.message : "Failed to unlock article";


      // Map technical errors to user-friendly messages
      if (
        message.includes("User rejected") ||
        message.includes("User denied") ||
        message.includes("user rejected")
      ) {
        setError("CANCELLED");
      } else if (message === "INSUFFICIENT_FUNDS" || message.includes("insufficient_funds")) {
        setError("INSUFFICIENT_FUNDS");
      } else if (message === "UNEXPECTED_ERROR" || message.includes("unexpected_error")) {
        setError("UNEXPECTED_ERROR");
      } else {
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address]);


  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-white">x402 on Monad</h1>
          <p className="text-zinc-400 text-sm">
            Micropayments via Thirdweb facilitator.{" "}
            <a href="https://docs.monad.xyz/guides/x402-guide" className="text-violet-400 hover:underline">
              Docs
            </a>
          </p>
        </div>


        <button
          onClick={handleUnlock}
          disabled={status === "loading"}
          className="w-full py-3 px-4 bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 disabled:cursor-wait text-white font-medium rounded-lg transition-colors"
        >
          {status === "loading" ? "Processing..." : "Pay & Unlock Content"}
        </button>


        <div className={`p-4 rounded-lg text-sm ${
          status === "error" ? "bg-red-950 text-red-300" :
          status === "success" ? "bg-green-950 text-green-300" :
          "bg-zinc-900 text-zinc-300"
        }`}>
          {message}
        </div>
      </div>
    </main>
  );
}
Running Your x402 App​

Now you're ready to test your x402 payment flow:

Start your development server:

npm run dev

Open http://localhost:3000 in your browser

Click "Pay & Unlock Content"

Connect your wallet

Approve the USDC payment

See the content unlock instantly!

Facilitator API​

For developers who are interested in using the barebones Facilitator API, here are the supported endpoints with examples.

Facilitator URL: https://x402-facilitator.molandak.org Network support: Mainnet and Testnet.

GET /supported​

Returns supported networks, schemes, and signer addresses.

const FACILITATOR_URL = "https://x402-facilitator.molandak.org";


async function testSupported(): Promise<void> {
  console.log("\n--- GET /supported ---");


  const response = await fetch(`${FACILITATOR_URL}/supported`);
  if (!response.ok) throw new Error(`Failed: ${response.status}`);


  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
  return data;
}
POST /verify​

Verify a payment signature.

interface NetworkConfig {
  chainId: Network;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  usdcAddress: `0x${string}`;
  usdcDecimals: number;
  chainIdNumber: number;
}


/**
 * This function manually constructs and signs the EIP-712 typed data that
 * the x402 client library handles automatically.
 */
async function testVerify(
  account: ReturnType<typeof privateKeyToAccount>,
  networkConfig: NetworkConfig
): Promise<{ isValid: boolean; payload: any }> {
  console.log("\n--- POST /verify ---");
  const now = Math.floor(Date.now() / 1000);
  const nonce = keccak256(toHex(Math.random().toString()));
  const ACCOUNT_ADDRESS = "0x0000000000000000000000000000000000000000";


  // TransferWithAuthorization parameters (ERC-3009)
  const authorization = {
    from: ACCOUNT_ADDRESS, // Account that is paying
    to: PAY_TO_ADDRESS, // Receiver address
    value: "1000", // 0.001 USDC (6 decimals)
    validAfter: (now - 60).toString(), // Start validity 60s in the past to handle clock skew
    validBefore: (now + 900).toString(), // 15 minutes
    nonce,
  };


  // EIP-712 domain - must match USDC contract's DOMAIN_SEPARATOR
  const domain = {
    name: "USDC",  // Monad USDC uses "USDC" (not "USD Coin")
    version: "2",
    chainId: BigInt(networkConfig.chainIdNumber),
    verifyingContract: networkConfig.usdcAddress,
  };


  // EIP-712 type definition for TransferWithAuthorization
  const types = {
    TransferWithAuthorization: [
      { name: "from", type: "address" },
      { name: "to", type: "address" },
      { name: "value", type: "uint256" },
      { name: "validAfter", type: "uint256" },
      { name: "validBefore", type: "uint256" },
      { name: "nonce", type: "bytes32" },
    ],
  };


  const message = {
    from: authorization.from,
    to: authorization.to,
    value: BigInt(authorization.value),
    validAfter: BigInt(authorization.validAfter),
    validBefore: BigInt(authorization.validBefore),
    nonce: authorization.nonce as `0x${string}`,
  };


  const signature = await account.signTypedData({
    domain,
    types,
    primaryType: "TransferWithAuthorization",
    message,
  });


  const requestBody = {
    x402Version: 2,
    payload: {
      authorization,
      signature,
    },
    resource: {
      url: "http://test/resource",
      description: "Test resource",
      mimeType: "application/json",
    },
    accepted: {
      scheme: "exact",
      network: networkConfig.chainId,
      amount: authorization.value,
      asset: networkConfig.usdcAddress,
      payTo: authorization.to,
      maxTimeoutSeconds: 300,
      extra: {
        name: "USDC",
        version: "2",
      },
    },
  };


  const response = await fetch(`${FACILITATOR_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });


  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));


  return { isValid: data.isValid, payload: requestBody };
}
POST /settle​

Execute the payment on-chain. Facilitator pays gas.

interface NetworkConfig {
  chainId: Network;
  name: string;
  rpcUrl: string;
  explorerUrl: string;
  usdcAddress: `0x${string}`;
  usdcDecimals: number;
  chainIdNumber: number;
}


/** POST /settle - Execute the payment on-chain. Facilitator pays gas. */
async function testSettle(
  payload: any,
  networkConfig: NetworkConfig
): Promise<void> {
  console.log("\n--- POST /settle ---");


  const response = await fetch(`${FACILITATOR_URL}/settle`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });


  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));


  if (data.success && data.transaction) {
    // Transaction success
  } else if (data.errorReason) {
    console.log(`Failed: ${data.errorReason}`);
  }
}
What's Next?​

You've successfully built an x402 payment-enabled app on Monad! Here are some ideas to extend your implementation:

Add more payable endpoints - Create different pricing tiers for various content or API calls
Build AI agent integrations - Enable autonomous agents to pay for and access your APIs
Resources​
x402 Protocol Specification
Monad Developer Discord
Migration Guide: V1 to V2
Need Help?​

If you run into issues or have questions, join the Monad Developer Discord

Happy building!

Previous
Build an MCP server that can interact with Monad Testnet
Next
ERC-8004 on Monad
What is x402?
Beyond legacy limitations
Why x402 on Monad?
Core Flow (Direct Payment)
Facilitator Flow (Recommended for Production)
Building an x402-based app using Monad x402 facilitator
Prerequisites
Step 1: Initialize a Next.js App
Step 2: Create a payTo address
Step 4: Create a server side payable endpoint
Step 5: Client-side setup (consuming paid endpoint)
Running Your x402 App
Facilitator API
GET /supported
POST /verify
POST /settle
What's Next?
Resources
Need Help?
Docs
Network Information
Deployment Summary
Tooling and Infrastructure
RPC Reference
Release Notes
Community
Developer Discord
Community Discord
Twitter
More
MonadVision Explorer
Network Visualization
Monad Home
Official Links
Copyright © 2026 Monad Foundation. Built with Docusaurus.