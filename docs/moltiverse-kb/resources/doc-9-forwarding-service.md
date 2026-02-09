# Document 9

Source: https://developers.circle.com/cctp/concepts/forwarding-service

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
Supported Blockchains and Domains
Finality and Block Confirmations
Forwarding Service
Quickstarts
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
How it works
Hook format
Fees and execution
Supported blockchains
CCTP
Get Started
Circle Forwarding Service
Copy page

Forward destination chain mints to simplify crosschain transfers

The Circle Forwarding Service is a service for CCTP that simplifies integration by removing the need for you to run multichain infrastructure. This can improve user experience for crosschain transfers by ensuring reliability and eliminating the need to handle destination chain gas fees.
​
How it works
A CCTP transfer without the Forwarding Service is a three-step process:
Create a transaction to burn USDC on the source chain and wait for Circle to sign an attestation.
Request an attestation from the Circle API.
Create a transaction to mint USDC on the destination chain.
This process requires you to have a wallet that can sign transactions on the source and destination chains, and native tokens for paying the transaction gas fee on both chains.
You use the Forwarding Service by including a forward request in the hook data of the burn transaction on the source chain. Circle validates the hook data, signs the attestation, and broadcasts the mint transaction on the destination chain for you, removing the need for you to handle the transaction on the destination chain.
For a full example of how to use the Forwarding Service, see Transfer USDC with the Forwarding Service.
​
Hook format
The hook data for Forwarding Service begins with the reserved magic bytes cctp-forward followed by versioning and payload fields. You can append your own custom hook data after Circle’s reserved space. Forwarding Service doesn’t support forwarding to wrapper contracts (for example, when destinationCaller is set).
Bytes	Type	Data
0-23	bytes24	cctp-forward
24-27	uint32	Version, set to 0
28-31	uint32	Length of additional Circle hook data, set to 0
32-51	any	Developer-defined hook data
If no additional integrator hook data is required, a static hex string can be used for the forwarding hook data:
Report incorrect code
Copy
// Includes magic bytes ("cctp-forward") + hook version (0) + empty data length (0)
const forwardHookData =
  "0x636374702d666f72776172640000000000000000000000000000000000000000";

​
Fees and execution
The Forwarding Service charges a fee for each transfer, in addition to the CCTP protocol fee. The Forwarding Service fee charged is to cover gas costs on the destination chain and a small service fee. The Forwarding Service prioritizes fast execution and quotes gas dynamically. If gas used is less than gas needed for execution, the remainder is spent as an additional priority fee where they are supported. On all chains, a higher fee provides a safety buffer for successful transaction delivery on the destination chain. Circle does not refund for excess gas and does not keep the excess gas, except in cases where excess priority fess are rejected.
The depositForBurnWithHook transaction includes a maxFee parameter. When using the Forwarding Service, this parameter should be set to a value that is large enough to cover the CCTP protocol fee and the Forwarding Service fee. Because the gas budget for the destination chain comes from a USDC fee on the source chain, choosing a lower maxFee results in a lower priority fee on the destination chain. A higher maxFee results in a higher priority fee on the destination chain and can result in faster confirmation.
The Forwarding Service charges a service fee for each transfer:
Destination chain	Service fee (USDC)
Ethereum	$1.25
All other chains	$0.20
If the maxFee parameter is insufficient to cover the both Fast Transfer protocol fee and the Forwarding Service fee, CCTP will prioritize forwarding execution over Fast Transfer. This means that the transfer will execute as a Standard Transfer with the Forwarding Service.
​
Supported blockchains
For a full list of supported blockchains, see CCTP Supported Blockchains.

Was this page helpful?

Yes
No
Finality and Block Confirmations
Previous
Transfer USDC from Ethereum to Arc
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