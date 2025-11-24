export type Address = `0x${string}`;

export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
}

export interface FaucetSettings {
  amount: bigint;
  cooldown: bigint;
}

export interface TransactionEvent {
  id: string;
  type: "mint" | "burn" | "transfer" | "faucet";
  from?: Address;
  to?: Address;
  amount?: number;
  timestamp: number;
  txHash: string;
  blockNumber?: number;
}

export interface DecryptedBalance {
  address: Address;
  value: bigint;
  timestamp: number;
}

export type TabType = "mint" | "burn" | "settings" | "transfer";

export interface IssuerAction {
  type: "mint" | "burn" | "transfer_ownership" | "update_faucet";
  params: Record<string, unknown>;
  timestamp: number;
  status: "pending" | "success" | "error";
  txHash?: string;
}
