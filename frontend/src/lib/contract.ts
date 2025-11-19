import { createPublicClient, createWalletClient, http, custom } from "viem";
import { sepolia } from "viem/chains";
import StablecoinMintABI from "../assets/abi/ShadowStablecoinMint.json";

// Contract address - deployed on Sepolia
export const CONTRACT_ADDRESS = "0xE8618c9CAb16C6A8DeFE84D9E3e0b2Cc86c6C02e" as const;

export const contractConfig = {
  address: CONTRACT_ADDRESS,
  abi: StablecoinMintABI.abi,
} as const;

// Public client for read operations
export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
});

// Create wallet client (requires connected wallet)
export function getWalletClient() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No wallet found");
  }

  return createWalletClient({
    chain: sepolia,
    transport: custom(window.ethereum),
  });
}

// Contract read functions
export async function getBalance(address: `0x${string}`) {
  return publicClient.readContract({
    ...contractConfig,
    functionName: "replicaBalanceOf",
    args: [address],
  });
}

export async function getTotalSupply() {
  return publicClient.readContract({
    ...contractConfig,
    functionName: "replicaTotalSupply",
  });
}

export async function getOwner() {
  return publicClient.readContract({
    ...contractConfig,
    functionName: "owner",
  });
}

export async function getFaucetAmount() {
  return publicClient.readContract({
    ...contractConfig,
    functionName: "faucetAmount",
  });
}

export async function getFaucetCooldown() {
  return publicClient.readContract({
    ...contractConfig,
    functionName: "faucetCooldown",
  });
}

export async function getTimeUntilNextClaim(address: `0x${string}`) {
  return publicClient.readContract({
    ...contractConfig,
    functionName: "replicaTimeUntilNextClaim",
    args: [address],
  });
}

export async function getLastFaucetClaim(address: `0x${string}`) {
  return publicClient.readContract({
    ...contractConfig,
    functionName: "lastFaucetClaim",
    args: [address],
  });
}

// Token info
export async function getTokenInfo() {
  const [name, symbol, decimals] = await Promise.all([
    publicClient.readContract({
      ...contractConfig,
      functionName: "name",
    }),
    publicClient.readContract({
      ...contractConfig,
      functionName: "symbol",
    }),
    publicClient.readContract({
      ...contractConfig,
      functionName: "decimals",
    }),
  ]);

  return { name, symbol, decimals };
}

// Ethereum type is already declared by wagmi/viem
