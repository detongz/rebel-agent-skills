# Document 8

Source: https://developers.circle.com/cctp

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
Key features
What you can build
Get started
Related products
CCTP
Cross-Chain Transfer Protocol
Copy page
Cross-Chain Transfer Protocol (CCTP) is a permissionless onchain utility that facilitates native USDC transfers across blockchains. CCTP burns USDC on the source blockchain and mints it on the destination blockchain, enabling secure 1:1 transfers without traditional bridge liquidity pools or wrapped tokens.
Use Bridge Kit to simplify crosschain transfers with CCTP.
Bridge Kit is an SDK that leverages CCTP as its protocol provider, letting you transfer USDC between blockchains in just a few lines of code.
​
Key features
Native USDC transfers
Transfer native USDC across blockchains without wrapped tokens or liquidity pools
Configurable transfer speeds
Choose between Fast Transfer for speed or Standard Transfer for cost efficiency
Programmable hooks
Trigger automated actions on the destination blockchain after USDC arrives
​
What you can build
CCTP enables you to build applications that require moving USDC across blockchains. Here are some common use cases:

Crosschain liquidity management

Crosschain swaps

Crosschain payments

Composable crosschain applications

​
Get started
Transfer USDC from Ethereum to Arc
Build a script to transfer USDC between EVM blockchains using CCTP
Transfer USDC from Solana to Arc
Transfer USDC from Solana to an EVM blockchain using CCTP
​
Related products
CCTP and Gateway offer different approaches to crosschain transfers. This table compares the two approaches.
Attribute	CCTP	Gateway
Use case	Transfer USDC from one blockchain to another	Hold a unified USDC balance accessible on any supported blockchain
Transfer speed	Fast Transfer: ~8-20 seconds
Standard Transfer: 15-19 minutes (Ethereum/L2s)	Instant (<500 ms) after balance is established
Balance model	Point-to-point transfers	Unified crosschain balance
Custody	Non-custodial	Non-custodial with 7-day trustless withdrawal option
Supported blockchains	View list	View list

Was this page helpful?

Yes
No
Bridge Kit SDK Reference
Previous
Supported Blockchains and Domains
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