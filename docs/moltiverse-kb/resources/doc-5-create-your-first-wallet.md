# Document 5

Source: https://developers.circle.com/wallets/dev-controlled/create-your-first-wallet

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
Wallets
Circle Wallets Overview
Wallets Products
Wallets: Modular
Wallets: User-Controlled
Wallets: Dev-Controlled
Overview
Quickstarts
Register Your Entity Secret
Create Your First Developer-Controlled Wallet
Receive an Inbound Transfer
Transfer Tokens from Wallet to Wallet
Tutorials
Gas Station
Compliance Engine
Concepts
Quickstarts
Tutorials
References
Contracts
Circle Contracts Overview
Concepts
Quickstarts
References
Paymaster
Paymaster Overview
Quickstarts
References
Developer Services
Supported Blockchains
Blockchain Confirmations
Chain ID for Signing Transactions
API Keys
Testnet vs. Mainnet
Testnet Faucets
Circle Developer Account
Developer Account Logs
Manage Team Members
Postman API Suite
Idempotent Requests
Compliance Requirements
HTTP Errors
Transaction States and Errors
Glossary
On this page
Prerequisites
1. Create a Wallet Set
2. Create a Wallet
Amoy example
Solana example
Next Steps
Wallets
Wallets Products
Wallets: Dev-Controlled
Quickstarts
Create Your First Developer-Controlled Wallet
Copy page

Create two developer-controlled wallets and send tokens between them.

Circle Wallets provide a comprehensive developer solution to storing, sending, and spending Web3 digital currencies and NFTs. You or your users can manage asset infrastructure. Circle provides a one-stop-shop experience with all the tools and services to handle the complex parts, including security, transaction monitoring, account recovery flows, and more.
This guide will assist you in creating a developer-controlled wallet. You will learn how to create a wallet set, and ultimately establish a wallet. Throughout this comprehensive guide, you will utilize both command line and API requests. These can be achieved by referring to Circle’s API references or utilizing cURL requests. For how to navigate the API references, see the Testing API References guide.
You can create wallets for both Smart Contract Accounts (SCA) and Externally Owned Accounts (EOA). To learn more, see the Account Types guide.
This guide features developer-controlled wallets. Circle Wallets also supports user-controlled wallets. Check out the user-controlled wallets quickstart.
​
Prerequisites
Get familiar with Wallet Sets.
Create a Developer Account and acquire an API key in the Console.
Install the Developer Services SDKs. (optional but recommended)
Make sure to Register Your Entity Secret prior to this Quickstart.

View sequence diagram

​
1. Create a Wallet Set
A wallet set refers to a unified set of wallets, all managed by a single cryptographic private key. This makes it possible to have wallets from different blockchains sharing the same address.
To create a wallet set, make a request to POST /developer/walletSets and create a wallet set providing a unique Entity Secret Ciphertext as described in How to Re-Encrypt the Entity Secret.
Node.js SDK
Python SDK
cURL
Report incorrect code
Copy
const response = await circleDeveloperSdk.createWalletSet({
  name: "Entity WalletSet A",
});

Response Body
Report incorrect code
Copy
{
  "data": {
    "walletSet": {
      "id": "0189bc61-7fe4-70f3-8a1b-0d14426397cb",
      "custodyType": "DEVELOPER",
      "updateDate": "2023-08-03T17:10:51Z",
      "createDate": "2023-08-03T17:10:51Z"
    }
  }
}

​
2. Create a Wallet
In Web3, a wallet isn’t just a storage mechanism for digital tokens or NFTs; it’s the core structure of all user interactions on the blockchain. A wallet is comprised of a unique address and accompanying metadata stored on the blockchain.
To create a wallet, make a POST request to /developer/wallets using the walletSet.id from step 2 and a count of 2 as request parameters. We’ll use the second wallet in the following quickstart to transfer tokens from wallet to wallet. NOTE: Don’t forget to generate a new Entity Secret Ciphertext.
​
Amoy example
The following code samples show how to create an SCA wallet on Amoy and the response.
Node.js SDK
Python SDK
cURL
Report incorrect code
Copy
const response = await circleDeveloperSdk.createWallets({
  accountType: "SCA",
  blockchains: ["MATIC-AMOY"],
  count: 2,
  walletSetId: "<wallet-set-id>",
});

Response Body
Report incorrect code
Copy
{
  "data": {
    "wallets": [
      {
        "id": "ce714f5b-0d8e-4062-9454-61aa1154869b",
        "state": "LIVE",
        "walletSetId": "0189bc61-7fe4-70f3-8a1b-0d14426397cb",
        "custodyType": "DEVELOPER",
        "address": "0xf5c83e5fede8456929d0f90e8c541dcac3d63835",
        "blockchain": "MATIC-AMOY",
        "accountType": "SCA",
        "updateDate": "2023-08-03T19:33:14Z",
        "createDate": "2023-08-03T19:33:14Z"
      },
      {
        "id": "703a83de-4851-47b8-ad08-94aa2271bfa6",
        "state": "LIVE",
        "walletSetId": "0189bc61-7fe4-70f3-8a1b-0d14426397cb",
        "custodyType": "DEVELOPER",
        "address": "0x7b777eb80e82f73f118378b15509cb48cd2c2ac3",
        "blockchain": "MATIC-AMOY",
        "accountType": "SCA",
        "updateDate": "2023-08-03T19:33:14Z",
        "createDate": "2023-08-03T19:33:14Z"
      }
    ]
  }
}

​
Solana example
The following code samples show how to create an EOA wallet on Solana and the response
Node.js SDK
Python SDK
cURL
Report incorrect code
Copy
const response = await circleDeveloperSdk.createWallets({
  accountType: "EOA",
  blockchains: ["SOL-DEVNET"],
  count: 1,
  walletSetId: "<wallet-set-id>",
});

Response Body
Report incorrect code
Copy
{
  "data": {
    "wallets": [
      {
        "id": "a7b8c2d1-1c1e-4f7d-b2c3-7f5b9e8c4a9d",
        "state": "LIVE",
        "walletSetId": "0189bc61-7fe4-70f3-8a1b-0d14426397cb",
        "custodyType": "DEVELOPER",
        "address": "9FMYUH1mcQ9F12yjjk6BciTuBC5kvMKadThs941v5vk7",
        "blockchain": "SOL-DEVNET",
        "accountType": "EOA",
        "updateDate": "2023-08-03T19:34:15Z",
        "createDate": "2023-08-03T19:34:15Z"
      }
    ]
  }
}

​
Next Steps
You have successfully created two developer-controlled wallets! Jump into the next guide, where you will learn how to acquire Testnet tokens and transfer them from wallet to wallet.
Transfer Tokens from Wallet to Wallet: Try out your first transfer from two onchain wallets.
Deploy a Smart Contract: Use your newly created wallet to deploy your first Smart Contract onchain.
Infrastructure Models: Learn more about the difference between user-controlled and developer-controlled wallets.
Unified Wallet Addressing on EVM Chains: Learn how to create and backfill wallets with the same address.

Was this page helpful?

Yes
No
Register Your Entity Secret
Previous
Receive an Inbound Transfer
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