# Document 7

Source: https://developers.circle.com/bridge-kit

Skip to main content
Circle Docs home page
Search...
⌘K
Sign in to console
Faucet
Help
Get Started
Assets
Build Onchain
Crosschain Transfers
Payments
Liquidity Services
API Reference
Developer Tools
Overview
Bridge Kit
Bridge Kit Overview
Get Started
Customize Your Transfers
Learn More
CCTP
CCTP Overview
Get Started
Fees and Allowances
Troubleshoot Transfers
HyperCore
Learn More
CCTP V1 (Legacy)
Gateway
Gateway Overview
Get Started
Fees
Create a Unified USDC Balance
Transfer a Unified USDC Balance Instantly
Learn More
On this page
Quickstart
Key features
Bridge Kit
Bridge Kit
Copy page
The Bridge Kit SDK lets you move USDC across blockchains in only a few lines of code. You can use it in client-side and server-side applications. The SDK provides a type-safe interface that works with Viem and Ethers. You can also extend the kit to support other wallet providers and frameworks.
This example shows how to bridge between an EVM and non-EVM chain in a single method call:
TypeScript
Report incorrect code
Copy
// Transfer 10.00 USDC from Ethereum to Solana
const result = await kit.bridge({
  from: { adapter: viemAdapter, chain: "Ethereum" },
  to: { adapter: solanaAdapter, chain: "Solana" },
  amount: "10.00",
});

​
Quickstart
To start bridging, follow the quickstart guide for the blockchains you plan to transfer between.
Transfer USDC from Arc to Base
Transfer USDC from Ethereum to Solana
Transfer USDC from Arc to Solana with Circle Wallets
​
Key features
Hundreds of bridge routes: Over a couple hundred bridge routes available between dozens of supported blockchains through Circle’s Cross-Chain Transfer Protocol (CCTP).
Simple setup: Start bridging in a few lines of code.
Application monetization: Collect a fee from end-users without writing new code.
Flexible configurations: Specify transfer speeds, custom RPC endpoints, and custom wallet clients.
Multiple supported wallets: Works with Viem, Ethers, and self-custody wallets such as MetaMask and Phantom.
Smart retry capabilities: Identify and recover stuck transactions.

Was this page helpful?

Yes
No
Crosschain Transfers
Previous
Bridge Kit Installation
Next
⌘I
Circle Docs home page

Legal

Developer Terms
Service Terms
Acceptable Use

Privacy

Privacy Policy
Cookie Policy
x
linkedin
instagram
youtube
discord
Powered by