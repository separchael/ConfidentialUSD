import { bytesToHex, getAddress } from "viem";
import type { Address } from "viem";

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;

const getSDK = () => {
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }
  const sdk = window.RelayerSDK || window.relayerSDK;
  if (!sdk) {
    throw new Error("Relayer SDK not loaded. Ensure the CDN script tag is present.");
  }
  return sdk;
};

export const initializeFHE = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  if (typeof window === "undefined") {
    throw new Error("FHE SDK requires a browser environment");
  }

  const ethereumProvider =
    provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;
  if (!ethereumProvider) {
    throw new Error("No wallet provider detected. Connect a wallet first.");
  }

  const sdk = getSDK();
  const { initSDK, createInstance, SepoliaConfig } = sdk;
  await initSDK();
  const config = { ...SepoliaConfig, network: ethereumProvider };
  fheInstance = await createInstance(config);
  return fheInstance;
};

const getInstance = async (provider?: any) => {
  if (fheInstance) return fheInstance;
  return initializeFHE(provider);
};

export const isFheReady = (): boolean => {
  return fheInstance !== null;
};

/**
 * Encrypt a transfer amount for the stablecoin contract
 */
export async function encryptTransferAmount(
  amount: bigint,
  contractAddress: Address,
  userAddress: Address,
  provider?: any
): Promise<{
  encryptedAmount: `0x${string}`;
  inputProof: `0x${string}`;
}> {
  const MAX_UINT64 = BigInt(2 ** 64 - 1);
  if (amount > MAX_UINT64) {
    throw new Error("Amount exceeds maximum supported value");
  }

  console.log('[FHE] Encrypting amount:', amount.toString());
  const instance = await getInstance(provider);
  const contractAddr = getAddress(contractAddress);
  const userAddr = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input for:', {
    contract: contractAddr,
    user: userAddr,
  });

  const input = instance.createEncryptedInput(contractAddr, userAddr);
  input.add64(Number(amount));

  console.log('[FHE] Encrypting input...');
  const { handles, inputProof } = await input.encrypt();
  console.log('[FHE] Encryption complete, handles:', handles.length);

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  return {
    encryptedAmount: bytesToHex(handles[0]) as `0x${string}`,
    inputProof: bytesToHex(inputProof) as `0x${string}`
  };
}

/**
 * Decrypt multiple handles using public decryption
 * The handles must have been made publicly decryptable via contract call
 */
export async function publicDecryptHandles(
  handles: `0x${string}`[],
  provider?: any
): Promise<{
  values: (number | bigint)[];
  abiEncoded: `0x${string}`;
  proof: `0x${string}`;
}> {
  if (handles.length === 0) {
    throw new Error("No handles provided for public decryption");
  }

  console.log('[FHE] Decrypting handles:', handles);
  const instance = await getInstance(provider);

  try {
    const result = await instance.publicDecrypt(handles);

    const normalized: Record<string, number | bigint> = {};
    Object.entries(result.clearValues || {}).forEach(([handle, value]) => {
      const key = handle.toLowerCase();
      normalized[key] = typeof value === "bigint" ? value : BigInt(value as number);
    });

    const values: (number | bigint)[] = handles.map((handle) => normalized[handle.toLowerCase()] ?? 0n);

    console.log('[FHE] Decrypted values:', values);

    return {
      values,
      abiEncoded: result.abiEncodedClearValues as `0x${string}`,
      proof: result.decryptionProof as `0x${string}`
    };
  } catch (error) {
    console.error("[FHE] Public decryption failed:", error);
    throw error;
  }
}

/**
 * Decrypt a single balance handle
 */
export async function decryptBalance(
  balanceHandle: `0x${string}`,
  provider?: any
): Promise<bigint> {
  const result = await publicDecryptHandles([balanceHandle], provider);
  const value = result.values[0];
  return typeof value === 'bigint' ? value : BigInt(value);
}

/**
 * Format token amount with decimals
 */
export function formatTokenAmount(amount: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const integerPart = amount / divisor;
  const fractionalPart = amount % divisor;

  if (fractionalPart === 0n) {
    return integerPart.toString();
  }

  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  const trimmedFractional = fractionalStr.replace(/0+$/, '');

  return `${integerPart}.${trimmedFractional}`;
}

/**
 * Parse token amount to bigint with decimals
 */
export function parseTokenAmount(amount: string, decimals: number = 6): bigint {
  const [integerPart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  return BigInt(integerPart + paddedFractional);
}

export { fheInstance };
