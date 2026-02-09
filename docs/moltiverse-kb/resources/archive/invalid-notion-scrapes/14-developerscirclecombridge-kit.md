> ## Documentation Index
> Fetch the complete documentation index at: https://developers.circle.com/llms.txt
> Use this file to discover all available pages before exploring further.

# Bridge Kit

The Bridge Kit SDK lets you move USDC across blockchains in only a few lines of
code. You can use it in client-side and server-side applications. The SDK
provides a type-safe interface that works with Viem and Ethers. You can also
extend the kit to support other wallet providers and frameworks.

This example shows how to bridge between an EVM and non-EVM chain in a single
method call:

```typescript TypeScript theme={null}
// Transfer 10.00 USDC from Ethereum to Solana
const result = await kit.bridge({
  from: { adapter: viemAdapter, chain: "Ethereum" },
  to: { adapter: solanaAdapter, chain: "Solana" },
  amount: "10.00",
});
```

## Quickstart

To start bridging, follow the quickstart guide for the blockchains you plan to
transfer between.

* [Transfer USDC from Arc to Base](/bridge-kit/quickstarts/transfer-usdc-from-arc-to-base)
* [Transfer USDC from Ethereum to Solana](/bridge-kit/quickstarts/transfer-usdc-from-ethereum-to-solana)
* [Transfer USDC from Arc to Solana with Circle Wallets](/bridge-kit/quickstarts/transfer-usdc-from-arc-to-solana-with-circle-wallets)

## Key features

* **Hundreds of bridge routes**: Over a couple hundred bridge routes available
  between dozens of supported blockchains through Circle's
  [Cross-Chain Transfer Protocol](/cctp) (CCTP).
* **Simple setup**: Start bridging in a few lines of code.
* **Application monetization**: Collect a fee from end-users without writing new
  code.
* **Flexible configurations**: Specify transfer speeds, custom RPC endpoints,
  and custom wallet clients.
* **Multiple supported wallets**: Works with Viem, Ethers, and self-custody
  wallets such as MetaMask and Phantom.
* **Smart retry capabilities**: Identify and recover stuck transactions.
