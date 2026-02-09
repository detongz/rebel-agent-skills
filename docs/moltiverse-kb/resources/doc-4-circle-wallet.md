# Circle Wallet ClawHub Skill

Source: https://clawhub.ai/eltontay/circle-wallet

circle-wallet
USDC wallet capabilities for OpenClaw agents via Circle Developer-Controlled Wallets
⭐ 1 · ⤓ 658 · ⤒ 0 current · 0 all-time
by
@eltontay
SECURITY SCAN
VirusTotal
Benign
View report →
Like a lobster shell, security has layers — review code before you run it.
CURRENT VERSION
v1.0.17
Download zip
latest
v1.0.17
Files
Compare
Versions
SKILL.md
Circle Wallet Skill
USDC wallet operations for OpenClaw agents via Circle Developer-Controlled Wallets.
Features
Create SCA wallets (Smart Contract Accounts)
Check USDC balances across multiple chains
Send USDC to any address
Gas-free transactions via Circle Gas Station
Multi-wallet management with address or ID
Address validation and balance checking
21 supported blockchains (mainnets + testnets)
Installation
clawhub install circle-wallet
cd ~/.openclaw/workspace/skills/circle-wallet
npm install
npm link
Quick Start
1. Get API Key
Get your API key from https://console.circle.com
2. Setup
New users:
circle-wallet setup --api-key your-api-key
Existing users:
circle-wallet configure --api-key your-key --entity-secret your-secret
3. Create Wallet & Get Funds
circle-wallet create "My Wallet"
circle-wallet drip                    # Testnet only
circle-wallet balance
4. Send USDC
circle-wallet send 0x... 10 --from 0x...
All Commands
# Setup
circle-wallet setup --api-key <key>                          # Generate and register entity secret
circle-wallet configure --api-key <key> --entity-secret <s>  # Use existing credentials
circle-wallet config                                         # View configuration
# Chains
circle-wallet chains                   # List all supported blockchains
circle-wallet chains --show-tokens     # Show USDC token IDs
circle-wallet chains --mainnet         # Mainnets only
circle-wallet chains --testnet         # Testnets only
# Wallets
circle-wallet create [name] [--chain <blockchain>]   # Create new SCA wallet
circle-wallet list                                    # List all wallets with balances
circle-wallet balance [wallet-id]                     # Check balance
# Transactions
circle-wallet send <to> <amount> [--from <wallet-id-or-address>]  # Auto-detects chain from wallet
circle-wallet drip [address]                                       # Get testnet USDC (sandbox only)
Supported Chains
Mainnets (10): APTOS, ARB, AVAX, BASE, ETH, MONAD, OP, MATIC, SOL, UNI
Testnets (11): APTOS-TESTNET, ARB-SEPOLIA, ARC-TESTNET, AVAX-FUJI, BASE-SEPOLIA, ETH-SEPOLIA, MONAD-TESTNET, OP-SEPOLIA, MATIC-AMOY, SOL-DEVNET, UNI-SEPOLIA
Use circle-wallet chains --show-tokens to see USDC token IDs for each chain.
Usage Examples
Multi-Chain Wallets
# Create wallets on different chains (default: ARC-TESTNET for sandbox)
circle-wallet create "Arc Wallet" --chain ARC-TESTNET
circle-wallet create "Base Wallet" --chain BASE-SEPOLIA
circle-wallet create "Polygon Wallet" --chain MATIC-AMOY
# Send automatically uses the correct chain for each wallet
circle-wallet send 0xRecipient... 5 --from 0xArcWallet...
circle-wallet send 0xRecipient... 3 --from 0xPolygonWallet...
Send Between Wallets
# Create two wallets
circle-wallet create "Wallet 1"
circle-wallet create "Wallet 2"
# Fund first wallet
circle-wallet drip
# Send from wallet 1 to wallet 2 (using addresses)
circle-wallet send 0xWallet2Address... 5 --from 0xWallet1Address...
Agent Usage
User: "Check my wallet balance"
Agent: [circle-wallet balance] "You have 42.5 USDC"
User: "Send 10 USDC to 0x123..."
Agent: [circle-wallet send 0x123... 10] "Sent! TX: 0xabc..."
Configuration
Credentials stored in: ~/.openclaw/circle-wallet/
Environment variables:
CIRCLE_API_KEY - Required for setup command
CIRCLE_ENV - Optional: sandbox or production (default: sandbox)
Troubleshooting
"No wallet configured"
circle-wallet create "My Wallet"
"Insufficient balance"
circle-wallet drip              # Testnet only
# Or fund wallet externally for mainnet
"Entity secret already registered"
circle-wallet configure --api-key <key> --entity-secret <secret>
"Invalid Ethereum address format" Address must be 0x followed by 40 hexadecimal characters.
Resources
Circle Developer Docs: https://developers.circle.com
Circle Console: https://console.circle.com
GitHub: https://github.com/eltontay/clawhub_circle_wallet_skill
License
MIT
Personal project for the OpenClaw community. Not officially endorsed by Circle.
Files
11 total
package-lock.json
20 KB
package.json
1.3 KB
SKILL.md
4.2 KB
tsconfig.json
477 B
src/wallet.ts
5.2 KB
src/entity.ts
1.2 KB
src/cli.ts
21 KB
src/utils.ts
2.1 KB
src/index.ts
618 B
src/config.ts
926 B
src/chains.ts
4.3 KB
Comments
No comments yet.