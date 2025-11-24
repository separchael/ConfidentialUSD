import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Address, DecryptedBalance, TabType, TransactionEvent } from "../types";

interface AppState {
  // User role
  isOwner: boolean;
  setIsOwner: (value: boolean) => void;

  // Decrypted balances cache
  decryptedBalances: Map<Address, DecryptedBalance>;
  setDecryptedBalance: (address: Address, value: bigint) => void;
  clearDecryptedBalance: (address: Address) => void;

  // UI state
  activeIssuerTab: TabType;
  setActiveIssuerTab: (tab: TabType) => void;

  // Transaction history
  recentEvents: TransactionEvent[];
  addEvent: (event: TransactionEvent) => void;
  clearEvents: () => void;

  // Loading states
  isDecrypting: Set<Address>;
  setDecrypting: (address: Address, value: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // User role
      isOwner: false,
      setIsOwner: (value) => set({ isOwner: value }),

      // Decrypted balances
      decryptedBalances: new Map(),
      setDecryptedBalance: (address, value) => {
        const normalizedAddress = address.toLowerCase() as Address;
        const newMap = new Map(get().decryptedBalances);
        newMap.set(normalizedAddress, {
          address: normalizedAddress,
          value,
          timestamp: Date.now(),
        });
        console.log('[AppStore] Setting decrypted balance:', normalizedAddress, value.toString());
        set({ decryptedBalances: newMap });
      },
      clearDecryptedBalance: (address) => {
        const normalizedAddress = address.toLowerCase() as Address;
        const newMap = new Map(get().decryptedBalances);
        newMap.delete(normalizedAddress);
        set({ decryptedBalances: newMap });
      },

      // UI state
      activeIssuerTab: "mint",
      setActiveIssuerTab: (tab) => set({ activeIssuerTab: tab }),

      // Transaction history
      recentEvents: [],
      addEvent: (event) => {
        console.log('[AppStore] Adding event:', event);
        set((state) => {
          // Check if event already exists
          const exists = state.recentEvents.some(e => e.txHash === event.txHash && e.type === event.type);
          if (exists) return state;

          // Add and sort by timestamp (newest first)
          const updated = [event, ...state.recentEvents]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);
          return { recentEvents: updated };
        });
      },
      clearEvents: () => set({ recentEvents: [] }),

      // Loading states
      isDecrypting: new Set(),
      setDecrypting: (address, value) => {
        const normalizedAddress = address.toLowerCase() as Address;
        const newSet = new Set(get().isDecrypting);
        if (value) {
          newSet.add(normalizedAddress);
        } else {
          newSet.delete(normalizedAddress);
        }
        set({ isDecrypting: newSet });
      },
    }),
    {
      name: "stablecoin-mint-storage",
      partialize: (state) => ({
        recentEvents: state.recentEvents,
      }),
    }
  )
);
