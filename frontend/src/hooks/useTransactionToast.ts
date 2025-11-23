import { useEffect, useRef } from "react";
import { useWaitForTransactionReceipt } from "wagmi";
import { txToast } from "./useToast";

interface TransactionToastOptions {
  pendingMessage: string;
  successMessage: string;
  errorMessage: string;
}

/**
 * Hook to automatically show toast notifications for transaction status changes.
 * Monitors the transaction hash and shows pending, success, or error toasts.
 */
export function useTransactionToast(
  hash: `0x${string}` | undefined,
  options: TransactionToastOptions
) {
  const { pendingMessage, successMessage, errorMessage } = options;

  const {
    isLoading: isConfirming,
    isSuccess,
    isError,
    error,
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Track which toasts we've already shown to avoid duplicates
  const shownToasts = useRef<{
    pending?: string;
    success?: string;
    error?: string;
  }>({});

  // Show pending toast when hash is received
  useEffect(() => {
    if (hash && !shownToasts.current.pending) {
      shownToasts.current.pending = hash;
      txToast.pending(pendingMessage, hash);
    }
  }, [hash, pendingMessage]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isSuccess && hash && shownToasts.current.pending === hash && !shownToasts.current.success) {
      shownToasts.current.success = hash;
      txToast.success(successMessage, hash);
    }
  }, [isSuccess, hash, successMessage]);

  // Show error toast when transaction fails
  useEffect(() => {
    if (isError && hash && shownToasts.current.pending === hash && !shownToasts.current.error) {
      shownToasts.current.error = hash;
      const message = error?.message || errorMessage;
      txToast.error(message.slice(0, 100), hash);
    }
  }, [isError, hash, error, errorMessage]);

  // Reset when hash changes (new transaction)
  useEffect(() => {
    if (!hash) {
      shownToasts.current = {};
    }
  }, [hash]);

  return {
    isConfirming,
    isSuccess,
    isError,
    error,
  };
}

/**
 * Hook to show wallet/signing error toasts.
 * Use this for errors that occur before transaction is submitted.
 */
export function useWalletErrorToast(error: Error | null) {
  const shownError = useRef<string | null>(null);

  useEffect(() => {
    if (error && error.message !== shownError.current) {
      shownError.current = error.message;

      // Parse common wallet errors
      let message = "Transaction rejected";

      if (error.message.includes("user rejected")) {
        message = "You rejected the transaction";
      } else if (error.message.includes("insufficient funds")) {
        message = "Insufficient funds for gas";
      } else if (error.message.includes("nonce")) {
        message = "Nonce error - please try again";
      } else if (error.message.length < 100) {
        message = error.message;
      }

      txToast.error(message);
    }
  }, [error]);

  useEffect(() => {
    if (!error) {
      shownError.current = null;
    }
  }, [error]);
}
