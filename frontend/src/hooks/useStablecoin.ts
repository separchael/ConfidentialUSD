import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount, useWriteContract } from "wagmi";
import { contractConfig } from "../lib/contract";
import { useTransactionToast, useWalletErrorToast } from "./useTransactionToast";
import type { Address } from "../types";

// Get encrypted balance
export function useBalance(address?: Address) {
  return useQuery({
    queryKey: ["balance", address],
    queryFn: async () => {
      if (!address) return null;
      const { publicClient } = await import("../lib/contract");
      return publicClient.readContract({
        ...contractConfig,
        functionName: "replicaBalanceOf",
        args: [address],
      });
    },
    enabled: !!address,
    refetchInterval: 10000,
  });
}

// Get total supply
export function useTotalSupply() {
  return useQuery({
    queryKey: ["totalSupply"],
    queryFn: async () => {
      const { publicClient } = await import("../lib/contract");
      return publicClient.readContract({
        ...contractConfig,
        functionName: "replicaTotalSupply",
      });
    },
    refetchInterval: 30000,
  });
}

// Get owner address
export function useOwner() {
  return useQuery({
    queryKey: ["owner"],
    queryFn: async () => {
      const { publicClient } = await import("../lib/contract");
      return publicClient.readContract({
        ...contractConfig,
        functionName: "owner",
      }) as Promise<Address>;
    },
  });
}

// Check if current user is owner
export function useIsOwner() {
  const { address } = useAccount();
  const { data: owner } = useOwner();

  return {
    isOwner: address && owner ? address.toLowerCase() === owner.toLowerCase() : false,
    owner,
  };
}

// Get faucet settings
export function useFaucetSettings() {
  return useQuery({
    queryKey: ["faucetSettings"],
    queryFn: async () => {
      const { publicClient } = await import("../lib/contract");
      const [amount, cooldown] = await Promise.all([
        publicClient.readContract({
          ...contractConfig,
          functionName: "faucetAmount",
        }),
        publicClient.readContract({
          ...contractConfig,
          functionName: "faucetCooldown",
        }),
      ]);
      return { amount: amount as bigint, cooldown: cooldown as bigint };
    },
  });
}

// Get time until next faucet claim
export function useFaucetCooldown(address?: Address) {
  return useQuery({
    queryKey: ["faucetCooldown", address],
    queryFn: async () => {
      if (!address) return 0n;
      const { publicClient } = await import("../lib/contract");
      return publicClient.readContract({
        ...contractConfig,
        functionName: "replicaTimeUntilNextClaim",
        args: [address],
      }) as Promise<bigint>;
    },
    enabled: !!address,
    refetchInterval: 1000,
  });
}

// Get token info
export function useTokenInfo() {
  return useQuery({
    queryKey: ["tokenInfo"],
    queryFn: async () => {
      const { publicClient } = await import("../lib/contract");
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
      return {
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
      };
    },
  });
}

// Claim faucet mutation with toast notifications
export function useClaimFaucet() {
  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  // Show wallet error toasts
  useWalletErrorToast(error);

  // Show transaction status toasts
  const { isConfirming, isSuccess, isError } = useTransactionToast(hash, {
    pendingMessage: "Claiming cUSD from faucet...",
    successMessage: "Successfully claimed 1000 cUSD!",
    errorMessage: "Failed to claim from faucet",
  });

  const claim = async () => {
    reset(); // Reset previous state
    writeContract({
      ...contractConfig,
      functionName: "claimReplicaFaucet",
    });
  };

  // Invalidate queries on success
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["faucetCooldown"] });
    queryClient.invalidateQueries({ queryKey: ["totalSupply"] });
  }

  return {
    claim,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
}

// Transfer mutation with toast notifications
export function useTransfer() {
  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  useWalletErrorToast(error);

  const { isConfirming, isSuccess, isError } = useTransactionToast(hash, {
    pendingMessage: "Transferring encrypted cUSD...",
    successMessage: "Transfer completed successfully!",
    errorMessage: "Transfer failed",
  });

  const transfer = async (to: Address, encryptedAmount: `0x${string}`, inputProof: `0x${string}`) => {
    reset();
    writeContract({
      ...contractConfig,
      functionName: "transferReplica",
      args: [to, encryptedAmount, inputProof],
    });
  };

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
  }

  return {
    transfer,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
}

// Mint mutation (owner only) with toast notifications
export function useMint() {
  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  useWalletErrorToast(error);

  const { isConfirming, isSuccess, isError } = useTransactionToast(hash, {
    pendingMessage: "Minting cUSD tokens...",
    successMessage: "Tokens minted successfully!",
    errorMessage: "Failed to mint tokens",
  });

  const mint = async (to: Address, amount: bigint) => {
    reset();
    writeContract({
      ...contractConfig,
      functionName: "mintReplica",
      args: [to, amount],
    });
  };

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["totalSupply"] });
  }

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
}

// Burn mutation (owner only) with toast notifications
export function useBurn() {
  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  useWalletErrorToast(error);

  const { isConfirming, isSuccess, isError } = useTransactionToast(hash, {
    pendingMessage: "Burning cUSD tokens...",
    successMessage: "Tokens burned successfully!",
    errorMessage: "Failed to burn tokens",
  });

  const burn = async (from: Address, amount: bigint) => {
    reset();
    writeContract({
      ...contractConfig,
      functionName: "burnReplica",
      args: [from, amount],
    });
  };

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["balance"] });
    queryClient.invalidateQueries({ queryKey: ["totalSupply"] });
  }

  return {
    burn,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
}

// Update faucet settings mutation (owner only) with toast notifications
export function useUpdateFaucetSettings() {
  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  useWalletErrorToast(error);

  const { isConfirming, isSuccess, isError } = useTransactionToast(hash, {
    pendingMessage: "Updating faucet settings...",
    successMessage: "Faucet settings updated!",
    errorMessage: "Failed to update faucet settings",
  });

  const updateSettings = async (newAmount: bigint, newCooldown: bigint) => {
    reset();
    writeContract({
      ...contractConfig,
      functionName: "setReplicaFaucetSettings",
      args: [newAmount, newCooldown],
    });
  };

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["faucetSettings"] });
  }

  return {
    updateSettings,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
}

// Transfer ownership mutation (owner only) with toast notifications
export function useTransferOwnership() {
  const queryClient = useQueryClient();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  useWalletErrorToast(error);

  const { isConfirming, isSuccess, isError } = useTransactionToast(hash, {
    pendingMessage: "Transferring ownership...",
    successMessage: "Ownership transferred successfully!",
    errorMessage: "Failed to transfer ownership",
  });

  const transferOwnership = async (newOwner: Address) => {
    reset();
    writeContract({
      ...contractConfig,
      functionName: "transferReplicaOwnership",
      args: [newOwner],
    });
  };

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["owner"] });
  }

  return {
    transferOwnership,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
}

// Make balance decryptable with toast notifications
export function useMakeBalanceDecryptable() {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();

  useWalletErrorToast(error);

  const { isConfirming, isSuccess, isError } = useTransactionToast(hash, {
    pendingMessage: "Making balance decryptable...",
    successMessage: "Balance is now decryptable!",
    errorMessage: "Failed to make balance decryptable",
  });

  const makeDecryptable = async () => {
    reset();
    writeContract({
      ...contractConfig,
      functionName: "makeBalanceDecryptable",
    });
  };

  return {
    makeDecryptable,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    isError,
    error,
  };
}
