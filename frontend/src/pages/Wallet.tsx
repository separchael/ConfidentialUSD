import { motion } from "framer-motion";
import { Wallet as WalletIcon, History } from "lucide-react";
import { PageContainer } from "../components/layout";
import { GlowCard, GlowCardHeader, GlowCardTitle, GlowCardContent } from "../components/ui/GlowCard";
import { CipherBalanceCard } from "../components/features/CipherBalanceCard";
import { TransferForm } from "../components/features/TransferForm";
import { EventTimeline } from "../components/features/EventTimeline";
import { useAccount } from "wagmi";
import { useBalance } from "../hooks/useStablecoin";
import { useFHE } from "../hooks/useFHE";
import { useAppStore } from "../stores/useAppStore";

export function Wallet() {
  const { address, isConnected } = useAccount();
  const { data: balanceHandle } = useBalance(address);
  const { decryptUserBalance, isDecrypting } = useFHE();
  const { recentEvents, decryptedBalances } = useAppStore();

  const decryptedBalance = address
    ? decryptedBalances.get(address.toLowerCase() as `0x${string}`)?.value
    : undefined;

  console.log('[Wallet] Decrypted balances map:', decryptedBalances);
  console.log('[Wallet] Looking up address:', address?.toLowerCase());
  console.log('[Wallet] Found decrypted balance:', decryptedBalance?.toString());

  const userEvents = recentEvents.filter(
    (event) =>
      event.from?.toLowerCase() === address?.toLowerCase() ||
      event.to?.toLowerCase() === address?.toLowerCase()
  );

  // Handle decrypt button click
  const handleDecrypt = async () => {
    if (!balanceHandle || !address) return;

    try {
      console.log('[Wallet] Balance handle from contract:', balanceHandle);
      console.log('[Wallet] Type of balance handle:', typeof balanceHandle);

      // The balance handle is returned as bytes32 from the contract
      // viem returns it as a hex string (0x prefixed)
      let handleHex: `0x${string}`;

      if (typeof balanceHandle === 'string') {
        // viem returns bytes32 as hex string
        handleHex = balanceHandle.startsWith('0x')
          ? balanceHandle as `0x${string}`
          : `0x${balanceHandle}` as `0x${string}`;
      } else if (typeof balanceHandle === 'bigint') {
        // Convert bigint to 64-character hex string (32 bytes)
        handleHex = `0x${balanceHandle.toString(16).padStart(64, '0')}` as `0x${string}`;
      } else if (typeof balanceHandle === 'number') {
        handleHex = `0x${BigInt(balanceHandle).toString(16).padStart(64, '0')}` as `0x${string}`;
      } else {
        // Handle as object or unknown type - try to stringify
        const str = String(balanceHandle);
        handleHex = str.startsWith('0x')
          ? str as `0x${string}`
          : `0x${str}` as `0x${string}`;
      }

      console.log('[Wallet] Formatted handle for decryption:', handleHex);
      await decryptUserBalance(handleHex);
    } catch (error) {
      console.error("Failed to decrypt balance:", error);
    }
  };

  if (!isConnected) {
    return (
      <PageContainer
        title="My Wallet"
        description="Connect your wallet to view your encrypted balance"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <WalletIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            Connect your wallet using the button in the header to view your
            encrypted cUSD balance and send transfers.
          </p>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="My Wallet"
      description="Manage your encrypted cUSD balance"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <CipherBalanceCard
            handle={balanceHandle ? String(balanceHandle) : undefined}
            decryptedValue={decryptedBalance}
            isDecrypting={isDecrypting}
            onDecrypt={handleDecrypt}
          />
        </motion.div>

        {/* Transfer Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <TransferForm />
        </motion.div>
      </div>

      {/* Transaction History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8"
      >
        <GlowCard>
          <GlowCardHeader>
            <GlowCardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Transaction History
            </GlowCardTitle>
          </GlowCardHeader>
          <GlowCardContent>
            <EventTimeline events={userEvents} />
          </GlowCardContent>
        </GlowCard>
      </motion.div>
    </PageContainer>
  );
}
