import { useEffect, useRef } from "react";
import { useAccount, useWatchContractEvent } from "wagmi";
import { contractConfig, publicClient } from "../lib/contract";
import { useAppStore } from "../stores/useAppStore";
import type { Address, TransactionEvent } from "../types";

interface TransferLog {
  transactionHash: string;
  blockNumber: bigint;
  args: {
    from?: Address;
    to?: Address;
  };
}

interface MintLog {
  transactionHash: string;
  blockNumber: bigint;
  args: {
    to?: Address;
    amount?: bigint;
  };
}

interface BurnLog {
  transactionHash: string;
  blockNumber: bigint;
  args: {
    from?: Address;
    amount?: bigint;
  };
}

interface FaucetLog {
  transactionHash: string;
  blockNumber: bigint;
  args: {
    user?: Address;
    amount?: bigint;
  };
}

/**
 * Hook to watch contract events and add them to the store
 */
export function useContractEvents() {
  const { address } = useAccount();
  const { addEvent, recentEvents } = useAppStore();
  const processedTxs = useRef(new Set<string>());
  const hasFetchedHistory = useRef(false);

  // Initialize processedTxs from existing events
  useEffect(() => {
    recentEvents.forEach((event) => {
      processedTxs.current.add(`${event.type}-${event.txHash}`);
    });
  }, []);

  // Fetch historical events when address changes
  useEffect(() => {
    if (!address || hasFetchedHistory.current) return;

    const fetchHistoricalEvents = async () => {
      try {
        console.log("[ContractEvents] Fetching historical events for:", address);

        // Get current block number
        const currentBlock = await publicClient.getBlockNumber();
        // Look back ~1000 blocks (about 3-4 hours on Sepolia)
        const fromBlock = currentBlock > 1000n ? currentBlock - 1000n : 0n;

        // Fetch Transfer events (user as sender or receiver)
        const transferLogs = await publicClient.getContractEvents({
          ...contractConfig,
          eventName: "Transfer",
          fromBlock,
          toBlock: currentBlock,
        });

        // Fetch FaucetClaimed events for this user
        const faucetLogs = await publicClient.getContractEvents({
          ...contractConfig,
          eventName: "FaucetClaimed",
          fromBlock,
          toBlock: currentBlock,
        });

        // Process Transfer events
        (transferLogs as unknown as TransferLog[]).forEach((log) => {
          const txHash = log.transactionHash;
          const from = log.args.from;
          const to = log.args.to;

          // Only include events for this user
          if (from?.toLowerCase() !== address.toLowerCase() &&
              to?.toLowerCase() !== address.toLowerCase()) {
            return;
          }

          if (processedTxs.current.has(`transfer-${txHash}`)) return;
          processedTxs.current.add(`transfer-${txHash}`);

          console.log("[ContractEvents] Historical Transfer:", { from, to, txHash });

          const event: TransactionEvent = {
            id: `transfer-${txHash}-${log.blockNumber}`,
            type: "transfer",
            from,
            to,
            timestamp: Date.now() - Number(currentBlock - log.blockNumber) * 12000, // Estimate timestamp
            txHash,
            blockNumber: Number(log.blockNumber),
          };

          addEvent(event);
        });

        // Process FaucetClaimed events
        (faucetLogs as unknown as FaucetLog[]).forEach((log) => {
          const txHash = log.transactionHash;
          const user = log.args.user;
          const amount = log.args.amount;

          // Only include events for this user
          if (user?.toLowerCase() !== address.toLowerCase()) {
            return;
          }

          if (processedTxs.current.has(`faucet-${txHash}`)) return;
          processedTxs.current.add(`faucet-${txHash}`);

          console.log("[ContractEvents] Historical FaucetClaimed:", { user, amount, txHash });

          const event: TransactionEvent = {
            id: `faucet-${txHash}-${log.blockNumber}`,
            type: "faucet",
            to: user,
            amount: amount ? Number(amount) : undefined,
            timestamp: Date.now() - Number(currentBlock - log.blockNumber) * 12000,
            txHash,
            blockNumber: Number(log.blockNumber),
          };

          addEvent(event);
        });

        hasFetchedHistory.current = true;
        console.log("[ContractEvents] Historical events loaded");
      } catch (error) {
        console.error("[ContractEvents] Failed to fetch historical events:", error);
      }
    };

    fetchHistoricalEvents();
  }, [address, addEvent]);

  // Watch Transfer events
  useWatchContractEvent({
    ...contractConfig,
    eventName: "Transfer",
    onLogs(logs) {
      (logs as unknown as TransferLog[]).forEach((log) => {
        const txHash = log.transactionHash;
        if (!txHash || processedTxs.current.has(`transfer-${txHash}`)) return;
        processedTxs.current.add(`transfer-${txHash}`);

        const from = log.args.from;
        const to = log.args.to;

        console.log("[ContractEvents] Transfer event:", { from, to, txHash });

        const event: TransactionEvent = {
          id: `transfer-${txHash}-${Date.now()}`,
          type: "transfer",
          from,
          to,
          timestamp: Date.now(),
          txHash,
        };

        addEvent(event);
      });
    },
  });

  // Watch Mint events
  useWatchContractEvent({
    ...contractConfig,
    eventName: "Mint",
    onLogs(logs) {
      (logs as unknown as MintLog[]).forEach((log) => {
        const txHash = log.transactionHash;
        if (!txHash || processedTxs.current.has(`mint-${txHash}`)) return;
        processedTxs.current.add(`mint-${txHash}`);

        const to = log.args.to;
        const amount = log.args.amount;

        console.log("[ContractEvents] Mint event:", { to, amount, txHash });

        const event: TransactionEvent = {
          id: `mint-${txHash}-${Date.now()}`,
          type: "mint",
          to,
          amount: amount ? Number(amount) : undefined,
          timestamp: Date.now(),
          txHash,
        };

        addEvent(event);
      });
    },
  });

  // Watch Burn events
  useWatchContractEvent({
    ...contractConfig,
    eventName: "Burn",
    onLogs(logs) {
      (logs as unknown as BurnLog[]).forEach((log) => {
        const txHash = log.transactionHash;
        if (!txHash || processedTxs.current.has(`burn-${txHash}`)) return;
        processedTxs.current.add(`burn-${txHash}`);

        const from = log.args.from;
        const amount = log.args.amount;

        console.log("[ContractEvents] Burn event:", { from, amount, txHash });

        const event: TransactionEvent = {
          id: `burn-${txHash}-${Date.now()}`,
          type: "burn",
          from,
          amount: amount ? Number(amount) : undefined,
          timestamp: Date.now(),
          txHash,
        };

        addEvent(event);
      });
    },
  });

  // Watch FaucetClaimed events
  useWatchContractEvent({
    ...contractConfig,
    eventName: "FaucetClaimed",
    onLogs(logs) {
      (logs as unknown as FaucetLog[]).forEach((log) => {
        const txHash = log.transactionHash;
        if (!txHash || processedTxs.current.has(`faucet-${txHash}`)) return;
        processedTxs.current.add(`faucet-${txHash}`);

        const user = log.args.user;
        const amount = log.args.amount;

        console.log("[ContractEvents] FaucetClaimed event:", { user, amount, txHash });

        const event: TransactionEvent = {
          id: `faucet-${txHash}-${Date.now()}`,
          type: "faucet",
          to: user,
          amount: amount ? Number(amount) : undefined,
          timestamp: Date.now(),
          txHash,
        };

        addEvent(event);
      });
    },
  });

  // Clean up processed txs periodically to prevent memory leak
  useEffect(() => {
    const interval = setInterval(() => {
      if (processedTxs.current.size > 1000) {
        processedTxs.current.clear();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);
}
