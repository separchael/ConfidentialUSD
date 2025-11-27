# Confidential USD (cUSD)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-orange.svg)](https://soliditylang.org/)
[![fhEVM](https://img.shields.io/badge/fhEVM-0.9.1-green.svg)](https://docs.zama.ai/fhevm)
[![Network](https://img.shields.io/badge/Network-Sepolia-yellow.svg)](https://sepolia.etherscan.io/)

A privacy-preserving stablecoin powered by Fully Homomorphic Encryption (FHE), enabling confidential transactions while maintaining regulatory compliance on Ethereum.

**Live Demo**: [https://stablecoin-mint.vercel.app](https://stablecoin-mint.vercel.app)
**Contract Address**: `0xE8618c9CAb16C6A8DeFE84D9E3e0b2Cc86c6C02e` (Sepolia)

---

## Table of Contents

- [Overview](#overview)
- [Why Privacy-Preserving Stablecoins?](#why-privacy-preserving-stablecoins)
- [Project Mechanism](#project-mechanism)
- [Use Cases](#use-cases)
- [Architecture](#architecture)
  - [System Architecture](#system-architecture)
  - [Contract Architecture](#contract-architecture)
  - [FHE Operations Flow](#fhe-operations-flow)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Development Roadmap](#development-roadmap)
- [Security Considerations](#security-considerations)
- [License](#license)

---

## Overview

Confidential USD (cUSD) is a privacy-preserving stablecoin built on Zama's fhEVM (Fully Homomorphic Encryption Virtual Machine). Unlike traditional stablecoins where all balances and transactions are publicly visible on-chain, cUSD encrypts account balances and transfer amounts using FHE, enabling private financial operations while maintaining the transparency and auditability required for regulatory compliance.

### Key Innovations

- **Encrypted Balances**: All user balances are stored as FHE ciphertexts on-chain
- **Confidential Transfers**: Transfer amounts remain encrypted throughout the transaction lifecycle
- **Fail-Closed Design**: Balance validation happens on encrypted data without revealing actual values
- **Selective Disclosure**: Users can choose to decrypt and reveal their balance when needed
- **Regulatory Compliance**: Owner-controlled minting/burning with optional audit capabilities

---

## Why Privacy-Preserving Stablecoins?

### The Problem with Traditional Stablecoins

Current stablecoins like USDT, USDC, and DAI expose sensitive financial data publicly:

- **No Financial Privacy**: All balances are visible to anyone with blockchain access
- **Transaction Surveillance**: Transfer amounts and patterns can be tracked by competitors, adversaries, or surveillance entities
- **Business Intelligence Leakage**: Competitors can analyze payment flows and business relationships
- **Salary Disclosure**: Payroll transactions reveal employee compensation data
- **Wealth Exposure**: Individual holdings are publicly queryable, creating security risks

### The cUSD Solution

cUSD leverages Fully Homomorphic Encryption to provide:

- **Balance Confidentiality**: Encrypted balances that only owners can decrypt
- **Private Transactions**: Transfer amounts encrypted end-to-end
- **Computational Privacy**: Smart contract logic executes on encrypted data without revealing plaintext values
- **Selective Transparency**: Users and regulators can decrypt data with proper authorization
- **On-Chain Privacy**: No off-chain trusted third parties required

---

## Project Mechanism

### How FHE Enables Encrypted Stablecoins

Confidential USD uses Zama's fhEVM to perform computations directly on encrypted data:

1. **Encryption Layer**: All sensitive values (balances, amounts) are encrypted using TFHE (Torus Fully Homomorphic Encryption)

2. **Encrypted State**: Smart contract storage holds ciphertexts instead of plaintexts:
   ```solidity
   mapping(address => euint64) private _balances;  // Encrypted balances
   euint64 private totalSupplyEncrypted;          // Encrypted total supply
   ```

3. **Homomorphic Operations**: The contract performs arithmetic on encrypted values without decryption:
   - `FHE.add(balance, amount)` - Add encrypted values
   - `FHE.sub(balance, amount)` - Subtract encrypted values
   - `FHE.le(amount, balance)` - Compare encrypted values
   - `FHE.select(condition, value1, value2)` - Conditional selection

4. **Permission System**: Fine-grained access control determines who can decrypt specific ciphertexts:
   ```solidity
   FHE.allow(_balances[user], user);  // User can decrypt their own balance
   FHE.allowThis(_balances[user]);    // Contract can operate on balance
   ```

5. **Fail-Closed Security**: Invalid operations (e.g., insufficient balance) silently transfer 0 instead of reverting, preventing information leakage through transaction failures

6. **Decryption Model**: v0.9.1 uses a self-relaying model where users call `makeBalanceDecryptable()` to enable off-chain decryption via Zama's relayer network

---

## Use Cases

### 1. Enterprise Payments

**Problem**: Businesses making B2B payments reveal transaction amounts and partner relationships to competitors.

**Solution**: cUSD enables confidential business payments where:
- Invoice amounts remain private
- Vendor relationships aren't exposed
- Competitive intelligence is protected
- Financial operations maintain confidentiality

**Example**: A company paying suppliers can hide payment amounts from competitors tracking blockchain data.

---

### 2. Payroll & HR Management

**Problem**: On-chain payroll exposes employee salaries, creating privacy concerns and internal tension.

**Solution**: cUSD allows companies to:
- Pay employees without revealing compensation data
- Maintain salary confidentiality between employees
- Comply with privacy regulations (GDPR, CCPA)
- Reduce HR friction around compensation transparency

**Example**: A DAO or crypto-native company can pay contributors in cUSD, keeping individual salaries private.

---

### 3. Personal Finance

**Problem**: Individuals holding stablecoins expose their wealth to the entire world, creating security and privacy risks.

**Solution**: cUSD provides:
- Private savings and holdings
- Confidential peer-to-peer transfers
- Protection from targeted attacks based on visible wealth
- Financial privacy as a human right

**Example**: Users can hold and transfer stablecoins without doxxing their net worth to everyone.

---

### 4. DeFi Integration (Future)

**Problem**: DeFi protocols require transparency for liquidations and collateral, but expose user positions.

**Solution**: Future cUSD integration with FHE-enabled DeFi protocols could enable:
- Private lending/borrowing positions
- Confidential trading on DEXs
- Hidden liquidity provision amounts
- Encrypted collateralization ratios

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌───────────┐ │
│  │ Dashboard  │  │   Wallet   │  │   Faucet   │  │   Issuer  │ │
│  └────────────┘  └────────────┘  └────────────┘  └───────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend Application                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React + TypeScript + Vite + TailwindCSS                 │   │
│  │  • RainbowKit (Wallet Connection)                        │   │
│  │  • Wagmi (Ethereum Interactions)                         │   │
│  │  • Zustand (State Management)                            │   │
│  │  • React Query (Data Fetching)                           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Blockchain Interaction Layer                  │
│  ┌──────────────┐         ┌──────────────┐                      │
│  │   Web3 RPC   │◄────────┤ fhEVM Client │                      │
│  └──────────────┘         └──────────────┘                      │
│         │                        │                              │
│         │                        │ Encrypted Input Proof        │
│         ▼                        ▼                              │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Ethereum Sepolia Testnet (fhEVM)              │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────────────┐ │   │
│  │  │     ShadowStablecoinMint Contract (cUSD)           │ │   │
│  │  │  ┌──────────────────────────────────────────────┐  │ │   │
│  │  │  │  Encrypted State Storage                     │  │ │   │
│  │  │  │  • mapping(address => euint64) _balances    │  │ │   │
│  │  │  │  • euint64 totalSupplyEncrypted             │  │ │   │
│  │  │  └──────────────────────────────────────────────┘  │ │   │
│  │  │                                                     │ │   │
│  │  │  ┌──────────────────────────────────────────────┐  │ │   │
│  │  │  │  FHE Operations (Zama fhEVM v0.9.1)          │  │ │   │
│  │  │  │  • FHE.add / FHE.sub                         │  │ │   │
│  │  │  │  • FHE.le (encrypted comparison)             │  │ │   │
│  │  │  │  • FHE.select (conditional)                  │  │ │   │
│  │  │  │  • FHE.makePubliclyDecryptable               │  │ │   │
│  │  │  └──────────────────────────────────────────────┘  │ │   │
│  │  │                                                     │ │   │
│  │  │  ┌──────────────────────────────────────────────┐  │ │   │
│  │  │  │  Public Functions                            │  │ │   │
│  │  │  │  • claimReplicaFaucet()                      │  │ │   │
│  │  │  │  • transferReplica(to, encAmount, proof)     │  │ │   │
│  │  │  │  • makeBalanceDecryptable()                  │  │ │   │
│  │  │  │  • mintReplica() [owner]                     │  │ │   │
│  │  │  │  • burnReplica() [owner]                     │  │ │   │
│  │  │  └──────────────────────────────────────────────┘  │ │   │
│  │  └────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Zama Decryption Infrastructure                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Relayer Network (Gateway Protocol)                      │   │
│  │  • Decrypts ciphertexts marked via makePubliclyDecryptable│  │
│  │  • Returns plaintext to authorized users                 │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

### Contract Architecture

```solidity
┌─────────────────────────────────────────────────────────────────────┐
│                  ShadowStablecoinMint Contract                      │
│                   (Inherits ZamaEthereumConfig)                     │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   Token Metadata         │
│  • name: "Confidential   │
│    USD"                  │
│  • symbol: "cUSD"        │
│  • decimals: 6           │
└──────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                        State Variables                             │
├────────────────────────────────────────────────────────────────────┤
│  Ownership                                                         │
│  • address owner                                                   │
│                                                                    │
│  Encrypted State                                                   │
│  • euint64 totalSupplyEncrypted    [Encrypted total supply]       │
│  • mapping(address => euint64) _balances  [Encrypted balances]    │
│                                                                    │
│  Faucet Configuration                                              │
│  • uint64 faucetAmount = 1000 * 10^6  [1000 cUSD per claim]       │
│  • uint256 faucetCooldown = 24 hours  [Claim frequency]           │
│  • mapping(address => uint256) lastFaucetClaim  [Claim timestamps]│
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                        Core Functions                              │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  User Functions (Public)                                           │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ claimReplicaFaucet()                                         │ │
│  │  • Checks cooldown period                                    │ │
│  │  • Mints faucetAmount to msg.sender                          │ │
│  │  • Updates lastFaucetClaim timestamp                         │ │
│  │  • Emits: FaucetClaimed, Mint                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ transferReplica(to, encryptedAmount, inputProof)             │ │
│  │  1. Verify encrypted input: FHE.fromExternal()               │ │
│  │  2. Check balance: hasSufficient = FHE.le(amount, balance)   │ │
│  │  3. Select transfer: FHE.select(hasSufficient, amount, 0)    │ │
│  │  4. Update sender: balance -= transferAmount                 │ │
│  │  5. Update receiver: balance += transferAmount               │ │
│  │  6. Set permissions for both parties                         │ │
│  │  7. Emit: Transfer(from, to)                                 │ │
│  │                                                               │ │
│  │  * Fail-closed: transfers 0 if insufficient balance          │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ makeBalanceDecryptable()                                     │ │
│  │  • Marks user's balance for public decryption                │ │
│  │  • Enables off-chain decryption via relayer-sdk              │ │
│  │  • Self-relaying model (v0.9.1)                              │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  Owner Functions (Privileged)                                      │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ mintReplica(to, amount)                                      │ │
│  │  • Encrypts plaintext amount                                 │ │
│  │  • Adds to recipient balance: FHE.add()                      │ │
│  │  • Updates total supply                                      │ │
│  │  • Sets permissions                                          │ │
│  │  • Emits: Mint                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ burnReplica(from, amount)                                    │ │
│  │  • Checks if user has sufficient balance (FHE.le)            │ │
│  │  • Selects burn amount: FHE.select()                         │ │
│  │  • Subtracts from balance: FHE.sub()                         │ │
│  │  • Updates total supply                                      │ │
│  │  • Emits: Burn                                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ setReplicaFaucetSettings(newAmount, newCooldown)             │ │
│  │  • Updates faucet configuration                              │ │
│  │  • Owner only                                                │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ transferReplicaOwnership(newOwner)                           │ │
│  │  • Transfers contract ownership                              │ │
│  │  • Emits: OwnershipTransferred                               │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  View Functions                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │ replicaBalanceOf(user) → euint64                             │ │
│  │ replicaTotalSupply() → euint64                               │ │
│  │ replicaTimeUntilNextClaim(user) → uint256                    │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                         Events                                     │
├────────────────────────────────────────────────────────────────────┤
│  • Mint(address indexed to, uint64 amount)                        │
│  • Burn(address indexed from, uint64 amount)                      │
│  • Transfer(address indexed from, address indexed to)             │
│  • OwnershipTransferred(address indexed prev, address indexed new)│
│  • FaucetClaimed(address indexed user, uint64 amount)             │
└────────────────────────────────────────────────────────────────────┘
```

---

### FHE Operations Flow

#### Transfer Flow with Encrypted Balance Validation

```
┌─────────────┐
│    User     │
│  (Sender)   │
└──────┬──────┘
       │
       │ 1. Create encrypted input for transfer amount
       │    using fhevmjs library
       │
       ▼
┌────────────────────────────────────────────┐
│  transferReplica(to, encAmount, proof)     │
└────────────────────────────────────────────┘
       │
       │ 2. Verify encrypted input
       ▼
┌────────────────────────────────────────────┐
│  euint64 amount =                          │
│    FHE.fromExternal(encAmount, proof)      │
└────────────────────────────────────────────┘
       │
       │ 3. Encrypted balance check
       ▼
┌────────────────────────────────────────────┐
│  ebool hasSufficient =                     │
│    FHE.le(amount, _balances[sender])       │
│                                            │
│  [Compares encrypted values without        │
│   revealing plaintext]                     │
└────────────────────────────────────────────┘
       │
       │ 4. Conditional selection (fail-closed)
       ▼
┌────────────────────────────────────────────┐
│  euint64 transferAmount =                  │
│    FHE.select(                             │
│      hasSufficient,                        │
│      amount,        // if true             │
│      FHE.asEuint64(0) // if false          │
│    )                                       │
│                                            │
│  [If insufficient: transfers 0 instead     │
│   of reverting, preventing info leakage]   │
└────────────────────────────────────────────┘
       │
       │ 5. Update encrypted balances
       ▼
┌────────────────────────────────────────────┐
│  _balances[sender] =                       │
│    FHE.sub(_balances[sender], transferAmt) │
│                                            │
│  _balances[recipient] =                    │
│    FHE.add(_balances[recipient], transferAmt)│
│                                            │
│  [Arithmetic on encrypted values]          │
└────────────────────────────────────────────┘
       │
       │ 6. Update access permissions
       ▼
┌────────────────────────────────────────────┐
│  FHE.allowThis(_balances[sender])          │
│  FHE.allowThis(_balances[recipient])       │
│  FHE.allow(_balances[sender], sender)      │
│  FHE.allow(_balances[recipient], recipient)│
│                                            │
│  [Grant decryption permissions]            │
└────────────────────────────────────────────┘
       │
       │ 7. Emit event (amounts NOT included)
       ▼
┌────────────────────────────────────────────┐
│  emit Transfer(sender, recipient)          │
│                                            │
│  [Public event but amount stays encrypted] │
└────────────────────────────────────────────┘
```

#### Balance Decryption Flow (v0.9.1 Self-Relaying)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
       │ 1. Call contract to mark balance decryptable
       ▼
┌────────────────────────────────────────────┐
│  makeBalanceDecryptable()                  │
│                                            │
│  FHE.makePubliclyDecryptable(              │
│    _balances[msg.sender]                   │
│  )                                         │
└────────────────────────────────────────────┘
       │
       │ 2. Contract emits decryption request
       ▼
┌────────────────────────────────────────────┐
│  Zama Gateway receives request             │
│  • Decryption handle created               │
│  • Request queued in gateway network       │
└────────────────────────────────────────────┘
       │
       │ 3. Wait for decryption (async)
       ▼
┌────────────────────────────────────────────┐
│  Gateway decrypts ciphertext               │
│  • Secure multi-party computation          │
│  • Returns plaintext value                 │
└────────────────────────────────────────────┘
       │
       │ 4. Frontend fetches decrypted value
       ▼
┌────────────────────────────────────────────┐
│  relayerClient.waitForDecryption(handle)   │
│  • Polls gateway for result                │
│  • Returns plaintext uint64 balance        │
└────────────────────────────────────────────┘
       │
       │ 5. Display to user
       ▼
┌────────────────────────────────────────────┐
│  UI shows actual balance:                  │
│  "1,000.00 cUSD"                           │
└────────────────────────────────────────────┘
```

---

## Key Features

### Smart Contract Features

- **Encrypted Balance Storage**: All balances stored as `euint64` ciphertexts using TFHE
- **Confidential Transfers**: Transfer amounts encrypted client-side before submission
- **Fail-Closed Design**: Insufficient balance transfers silently send 0 instead of reverting
- **Permission-Based Decryption**: Fine-grained access control for ciphertext decryption
- **Owner Controls**: Privileged minting/burning for regulatory compliance
- **Public Faucet**: 24-hour cooldown testnet faucet with 1,000 cUSD per claim
- **Self-Relaying Decryption**: v0.9.1 model using `makePubliclyDecryptable()` for off-chain decryption
- **Event Emission**: On-chain events for transfer tracking without revealing amounts

### Frontend Features

- **RainbowKit Integration**: Multi-wallet support with automatic network switching
- **Real-Time Balance Decryption**: Async balance fetching via Zama relayer SDK
- **Transaction History**: Event timeline showing transfers with encrypted amounts
- **Responsive UI**: Mobile-first design with TailwindCSS
- **Dark Theme**: Cyberpunk-inspired dark UI with cyan accents
- **Encrypted Input Creation**: Client-side encryption using fhevmjs
- **Owner Dashboard**: Special issuer panel for minting/burning operations
- **Network Guard**: Automatic Sepolia network detection and switching
- **Toast Notifications**: Real-time feedback for all operations
- **Demo Documentation**: Built-in video demo and comprehensive docs page

---

## Technology Stack

### Smart Contract Layer

| Component | Version | Purpose |
|-----------|---------|---------|
| **Solidity** | 0.8.24 | Smart contract language |
| **Zama fhEVM** | 0.9.1 | Fully Homomorphic Encryption virtual machine |
| **@fhevm/solidity** | 0.9.1 | FHE operations library (FHE.add, FHE.sub, FHE.le, etc.) |
| **Hardhat** | 2.26.3 | Development environment and testing framework |
| **@fhevm/hardhat-plugin** | 0.3.0-1 | fhEVM integration for Hardhat |
| **Ethers.js** | 6.13.4 | Ethereum library for deployment scripts |
| **@zama-fhe/relayer-sdk** | 0.3.0-5 | Decryption relayer client for gateway protocol |

### Frontend Layer

| Component | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.6.0 | Type safety |
| **Vite** | 5.4.0 | Build tool and dev server |
| **TailwindCSS** | 3.4.15 | Utility-first CSS framework |
| **RainbowKit** | 2.2.9 | Wallet connection with network switching |
| **Wagmi** | 2.12.0 | React hooks for Ethereum |
| **Viem** | 2.21.0 | TypeScript Ethereum library |
| **@tanstack/react-query** | 5.60.0 | Async state management |
| **Zustand** | 5.0.0 | Global state management |
| **Framer Motion** | 11.11.0 | Animation library |
| **React Router DOM** | 6.28.0 | Client-side routing |
| **Lucide React** | 0.460.0 | Icon library |
| **Radix UI** | Various | Headless UI components (dialog, dropdown, toast, etc.) |

### Infrastructure

| Component | Purpose |
|-----------|---------|
| **Ethereum Sepolia** | Testnet deployment (Zama fhEVM-enabled) |
| **Vercel** | Frontend hosting with automatic deployments |
| **Etherscan** | Block explorer for contract verification |
| **Zama Gateway** | Decryption infrastructure for FHE ciphertexts |

---

## Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **Git**
- **MetaMask** or other Web3 wallet
- **Sepolia ETH** (for gas fees)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/StablecoinMint.git
   cd StablecoinMint
   ```

2. **Install contract dependencies**
   ```bash
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

4. **Configure environment variables**

   Create `.env` in project root:
   ```env
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   PRIVATE_KEY=your_private_key_here
   ```

   Create `frontend/.env`:
   ```env
   VITE_CONTRACT_ADDRESS=0xE8618c9CAb16C6A8DeFE84D9E3e0b2Cc86c6C02e
   ```

### Running Locally

#### Contract Development

```bash
# Compile contracts
npm run compile

# Run tests (requires fhEVM local node)
npm run test

# Run specific test suites
npm run test:basic      # Basic minting/burning
npm run test:transfer   # Transfer logic
npm run test:owner      # Owner functions
npm run test:fhe        # FHE operations
```

#### Frontend Development

```bash
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

### Deployment

#### Deploy Contract to Sepolia

```bash
npm run deploy:sepolia
```

Update `frontend/src/lib/contract.ts` with the deployed contract address.

#### Deploy Frontend to Vercel

```bash
cd frontend
npm run build
vercel --prod
```

---

## Development Roadmap

### Phase 1: Core Infrastructure (Q4 2024) ✅ Completed

**Objective**: Build and deploy privacy-preserving stablecoin with basic functionality

- ✅ Smart contract development with fhEVM v0.9.1
- ✅ Encrypted balance storage using `euint64`
- ✅ Confidential transfer implementation with fail-closed design
- ✅ Owner-controlled minting and burning
- ✅ Public faucet with 24-hour cooldown
- ✅ Permission-based decryption system
- ✅ Comprehensive unit test suite (4 test files, 15+ tests)
- ✅ Sepolia testnet deployment
- ✅ Frontend application with RainbowKit integration
- ✅ Real-time balance decryption via relayer SDK
- ✅ Transaction history and event timeline
- ✅ Owner issuer dashboard
- ✅ Documentation and demo video
- ✅ Vercel production deployment

**Deliverables**:
- Fully functional privacy-preserving stablecoin on Sepolia
- Web application for user interaction
- Comprehensive documentation
- Open-source codebase

---

### Phase 2: Enhanced Privacy & DeFi Integration (Q1 2025)

**Objective**: Expand privacy features and enable DeFi composability

**Smart Contract Enhancements**:
- **Encrypted Allowances**: Implement `approveEncrypted()` for private spending limits
- **Delegate Transfers**: Allow approved spenders to transfer on behalf of users
- **Batch Operations**: Support multi-recipient transfers in single transaction
- **Advanced Access Control**: Role-based permissions (admin, auditor, compliance officer)
- **Encrypted Metadata**: Store private transaction notes/memos on-chain
- **Time-Locked Transfers**: Schedule future transfers with encrypted release conditions

**DeFi Protocol Integration**:
- **Private DEX Integration**: Integrate with FHE-enabled DEX for confidential swaps
- **Liquidity Pools**: Enable private liquidity provision with encrypted LP shares
- **Private Lending**: Integration with encrypted lending protocols
- **Yield Farming**: Private staking and yield generation mechanisms
- **Cross-Chain Bridge**: Encrypted bridge to other Zama fhEVM chains

**Developer Experience**:
- **SDK Development**: JavaScript/TypeScript SDK for easier integration
- **CLI Tools**: Command-line tools for contract interaction
- **GraphQL API**: Indexed query layer for event data
- **Developer Documentation**: Integration guides and API references

**Deliverables**:
- Enhanced contract with DeFi primitives
- DEX and lending protocol integrations
- Developer SDK and tools
- Mainnet deployment preparation

---

### Phase 3: Regulatory Compliance & Enterprise Features (Q2-Q3 2025)

**Objective**: Enable enterprise adoption with regulatory compliance tools

**Compliance Framework**:
- **Selective Disclosure**: Auditor keys for regulatory balance inspection
- **Compliance Oracle**: Automated AML/KYC checks with encrypted user data
- **Transaction Limits**: Configurable daily/monthly transfer limits per address
- **Whitelisting/Blacklisting**: Encrypted compliance lists without revealing identities
- **Audit Trail**: Encrypted audit logs with selective decryption for regulators
- **FATF Travel Rule**: Private sender/recipient information disclosure to authorized parties

**Enterprise Features**:
- **Multi-Signature Wallets**: FHE-enabled multi-sig for corporate treasuries
- **Payroll Automation**: Smart contract payroll with encrypted salaries
- **Invoice Management**: On-chain invoicing with private amounts
- **Treasury Management**: Corporate treasury dashboard with role-based access
- **API Gateway**: Enterprise API for programmatic access
- **SLA Guarantees**: Service level agreements for enterprise clients

**Scalability & Performance**:
- **Gas Optimization**: Reduce FHE operation costs through batching
- **Layer 2 Integration**: Deploy on Zama L2 for lower fees
- **Caching Layer**: Off-chain caching for frequently accessed encrypted data
- **Performance Monitoring**: Real-time metrics and alerting

**Institutional Infrastructure**:
- **Custody Integration**: Support for institutional custody providers
- **Fiat On/Off Ramps**: Integration with compliant fiat gateways
- **Accounting Integration**: Export tools for QuickBooks, Xero, etc.
- **Tax Reporting**: Generate encrypted transaction reports for tax authorities

**Mainnet Launch**:
- **Security Audits**: Comprehensive audits by Trail of Bits, OpenZeppelin
- **Economic Modeling**: Stability mechanism design and stress testing
- **Liquidity Bootstrapping**: Initial liquidity provision strategies
- **Marketing Campaign**: Community building and user onboarding
- **Ethereum Mainnet Deployment**: Production launch on fhEVM mainnet

**Deliverables**:
- Compliance-ready stablecoin with regulatory features
- Enterprise dashboard and tooling
- Mainnet deployment with liquidity
- Partnerships with custody providers and exchanges
- Institutional adoption and usage metrics

---

## Security Considerations

### Smart Contract Security

- **Fail-Closed Design**: Transfers silently send 0 on insufficient balance instead of reverting, preventing balance inference through reverts
- **Permission System**: Strict access control on ciphertext decryption via `FHE.allow()`
- **Owner Privileges**: Centralized minting/burning for current phase (decentralization planned for Phase 3)
- **Input Verification**: All encrypted inputs validated via `FHE.fromExternal()` with zk-SNARK proofs
- **No Reentrancy**: Transfer logic doesn't make external calls, eliminating reentrancy risks
- **Faucet Rate Limiting**: 24-hour cooldown prevents abuse

### Cryptographic Security

- **TFHE Encryption**: 128-bit security level using Torus Fully Homomorphic Encryption
- **Semantic Security**: Ciphertexts reveal no information about plaintext values
- **Malleability Protection**: Input proofs prevent ciphertext manipulation attacks
- **Key Management**: Private keys managed by Zama gateway threshold network

### Operational Security

- **Testnet Deployment**: Current deployment is on Sepolia testnet for testing only
- **No Real Value**: Test tokens have no monetary value
- **Audit Pending**: Full security audit planned before mainnet launch
- **Bug Bounty**: Community bug bounty program coming in Phase 2

### Known Limitations

- **Centralized Ownership**: Owner has unilateral minting/burning power (governance planned for Phase 3)
- **Decryption Latency**: Balance decryption takes 5-30 seconds via gateway network
- **Gas Costs**: FHE operations are more expensive than plaintext (optimizations ongoing)
- **Network Dependence**: Relies on Zama gateway availability for decryption

---

## Contributing

We welcome contributions from the community! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Resources

- **Documentation**: [https://stablecoin-mint.vercel.app/doc](https://stablecoin-mint.vercel.app/doc)
- **Live Demo**: [https://stablecoin-mint.vercel.app](https://stablecoin-mint.vercel.app)
- **Contract**: [0xE8618c9CAb16C6A8DeFE84D9E3e0b2Cc86c6C02e](https://sepolia.etherscan.io/address/0xE8618c9CAb16C6A8DeFE84D9E3e0b2Cc86c6C02e)
- **Zama Docs**: [https://docs.zama.ai/fhevm](https://docs.zama.ai/fhevm)
- **fhEVM Repository**: [https://github.com/zama-ai/fhevm](https://github.com/zama-ai/fhevm)

---

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## Acknowledgments

- **Zama** for developing fhEVM and pioneering FHE in blockchain
- **RainbowKit** for excellent wallet connection UX
- **Ethereum Foundation** for Sepolia testnet infrastructure
- The open-source community for foundational tools and libraries

---

## Contact

For questions, feedback, or collaboration opportunities:

- **GitHub Issues**: [https://github.com/yourusername/StablecoinMint/issues](https://github.com/yourusername/StablecoinMint/issues)
- **Twitter**: [@ConfidentialUSD](https://twitter.com/ConfidentialUSD)
- **Email**: contact@confidentialusd.xyz

---

**Disclaimer**: This is experimental software deployed on testnet for demonstration purposes. Test tokens have no real value. Use at your own risk. Full security audit required before mainnet deployment.
