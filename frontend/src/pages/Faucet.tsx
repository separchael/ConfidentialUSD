import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { PageContainer } from "../components/layout";
import { FaucetPanel } from "../components/features/FaucetPanel";
import { useAccount } from "wagmi";

export function Faucet() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <PageContainer>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Wallet className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Wallet Not Connected
          </h2>
          <p className="text-muted-foreground text-center max-w-md">
            Connect your wallet to claim free cUSD tokens from the faucet.
          </p>
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FaucetPanel />
        </motion.div>
      </div>
    </PageContainer>
  );
}
