import { useState, useCallback } from "react";
import { useAccount } from "wagmi";
import {
  encryptTransferAmount,
  publicDecryptHandles,
  decryptBalance,
  formatTokenAmount,
  isFheReady,
} from "../lib/fhe";
import { CONTRACT_ADDRESS } from "../lib/contract";
import { useAppStore } from "../stores/useAppStore";
import { txToast } from "./useToast";
import type { Address } from "../types";

export function useFHE() {
  const { address } = useAccount();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setDecryptedBalance, setDecrypting } = useAppStore();

  /**
   * Encrypt transfer amount for the stablecoin contract
   */
  const encryptAmount = useCallback(
    async (amount: bigint) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setIsEncrypting(true);
      setError(null);

      try {
        console.log('[useFHE] Encrypting amount:', amount.toString());
        const result = await encryptTransferAmount(
          amount,
          CONTRACT_ADDRESS,
          address
        );
        console.log('[useFHE] Encryption successful');
        return result;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Encryption failed";
        setError(errorMsg);
        console.error("[useFHE] Encryption error:", err);
        throw new Error(errorMsg);
      } finally {
        setIsEncrypting(false);
      }
    },
    [address]
  );

  /**
   * Decrypt balance for the connected wallet
   * The balance must have been made publicly decryptable first via makeBalanceDecryptable()
   */
  const decryptUserBalance = useCallback(
    async (balanceHandle: `0x${string}`) => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      // Check if handle is valid (not zero)
      if (balanceHandle === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        console.log('[useFHE] Balance handle is zero, setting balance to 0');
        setDecryptedBalance(address, 0n);
        return 0n;
      }

      setIsDecrypting(true);
      setDecrypting(address, true);
      setError(null);

      const toastId = txToast.pending("Decrypting your balance...");

      try {
        console.log('[useFHE] Decrypting balance handle:', balanceHandle);
        const decryptedValue = await decryptBalance(balanceHandle);
        console.log('[useFHE] Decrypted balance:', decryptedValue.toString());

        // Store decrypted balance
        setDecryptedBalance(address, decryptedValue);

        toastId.dismiss();
        txToast.success(`Balance decrypted: ${formatTokenAmount(decryptedValue, 6)} cUSD`);

        return decryptedValue;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Decryption failed";
        setError(errorMsg);
        console.error("[useFHE] Decryption error:", err);

        toastId.dismiss();
        txToast.error(errorMsg);

        throw new Error(errorMsg);
      } finally {
        setIsDecrypting(false);
        setDecrypting(address, false);
      }
    },
    [address, setDecryptedBalance, setDecrypting]
  );

  /**
   * Decrypt multiple handles at once
   */
  const decryptHandles = useCallback(async (handles: `0x${string}`[]) => {
    try {
      console.log('[useFHE] Decrypting handles:', handles);
      const result = await publicDecryptHandles(handles);
      console.log('[useFHE] Decryption successful');
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Decryption failed";
      console.error("[useFHE] Decryption error:", err);
      throw new Error(errorMsg);
    }
  }, []);

  return {
    isReady: true, // Always ready - initialization happens on-demand
    isEncrypting,
    isDecrypting,
    error,
    encryptAmount,
    decryptUserBalance,
    decryptHandles,
    formatTokenAmount,
  };
}
