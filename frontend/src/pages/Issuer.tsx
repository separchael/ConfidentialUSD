import { motion } from "framer-motion";
import { ShieldX, Wallet } from "lucide-react";
import { PageContainer } from "../components/layout";
import { IssuerActions } from "../components/features/IssuerActions";
import { GlowCard, GlowCardContent } from "../components/ui/GlowCard";
import { AddressDisplay } from "../components/ui/AddressDisplay";
import { useAccount } from "wagmi";
import { useIsOwner, useOwner } from "../hooks/useStablecoin";

export function Issuer() {
  const { isConnected } = useAccount();
  const { isOwner, owner } = useIsOwner();

  if (!isConnected) {
    return (
      <PageContainer
        title="Issuer Panel"
        description="Contract owner administration"
      >
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
            Connect your wallet to access the issuer panel.
          </p>
        </motion.div>
      </PageContainer>
    );
  }

  if (!isOwner) {
    return (
      <PageContainer
        title="Issuer Panel"
        description="Contract owner administration"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20"
        >
          <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
            <ShieldX className="h-10 w-10 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Only the contract owner can access the issuer panel.
          </p>
          {owner && (
            <GlowCard className="max-w-md">
              <GlowCardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Current Owner
                </p>
                <AddressDisplay address={owner} chars={8} />
              </GlowCardContent>
            </GlowCard>
          )}
        </motion.div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Issuer Panel"
      description="Manage token minting, burning, and settings"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <IssuerActions />
        </motion.div>
      </div>
    </PageContainer>
  );
}
