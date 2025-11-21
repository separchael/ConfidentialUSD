import { Droplets, Clock, CheckCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowCard } from "../ui/GlowCard";
import { Button } from "../ui/Button";
import { CircularCountdown } from "../ui/CountdownTimer";
import { formatAmount } from "../../lib/utils";
import { useClaimFaucet, useFaucetSettings, useFaucetCooldown } from "../../hooks/useStablecoin";
import { useAccount } from "wagmi";

interface FaucetPanelProps {
  className?: string;
}

export function FaucetPanel({ className }: FaucetPanelProps) {
  const { address } = useAccount();
  const { data: settings } = useFaucetSettings();
  const { data: cooldown } = useFaucetCooldown(address);
  const { claim, isPending, isConfirming, isSuccess } = useClaimFaucet();

  const isLoading = isPending || isConfirming;
  const canClaim = cooldown !== undefined && cooldown === 0n;
  const cooldownSeconds = cooldown ? Number(cooldown) : 0;
  const maxCooldown = settings?.cooldown ? Number(settings.cooldown) : 86400;

  return (
    <GlowCard className={className} glowColor="cyan">
      <div className="text-center space-y-8">
        {/* Icon */}
        <motion.div
          className="relative mx-auto w-24 h-24"
          animate={canClaim ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-cyan-500/20 rounded-full blur-xl" />
          <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gradient-to-br from-sky-500/10 to-cyan-500/10 border border-primary/20">
            <Droplets className="h-10 w-10 text-primary" />
          </div>
          {canClaim && (
            <motion.div
              className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold gradient-text">cUSD Faucet</h2>
          <p className="text-muted-foreground mt-2">
            Claim free cUSD tokens for testing
          </p>
        </div>

        {/* Amount Display */}
        {settings && (
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">Claim Amount</p>
            <p className="text-4xl font-bold text-foreground">
              {formatAmount(settings.amount, 6)}
              <span className="text-xl text-muted-foreground ml-2">cUSD</span>
            </p>
          </div>
        )}

        {/* Countdown or Success */}
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="py-4 space-y-3"
            >
              <div className="mx-auto w-16 h-16 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <p className="text-success font-medium">
                Successfully claimed!
              </p>
              <p className="text-sm text-muted-foreground">
                Your encrypted balance has been updated
              </p>
            </motion.div>
          ) : !canClaim && cooldownSeconds > 0 ? (
            <motion.div
              key="countdown"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4 space-y-4"
            >
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Next claim available in</span>
              </div>
              <CircularCountdown
                seconds={cooldownSeconds}
                maxSeconds={maxCooldown}
                size={140}
              />
            </motion.div>
          ) : (
            <motion.div
              key="ready"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-4"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/20 border border-success/30">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-success text-sm font-medium">
                  Ready to claim!
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Claim Button */}
        <Button
          onClick={() => claim()}
          disabled={!canClaim || isLoading || !address}
          loading={isLoading}
          size="lg"
          className="w-full max-w-xs mx-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isPending ? "Confirming..." : "Claiming..."}
            </>
          ) : (
            <>
              <Droplets className="h-4 w-4" />
              Claim {settings ? formatAmount(settings.amount, 6) : ""} cUSD
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="flex items-center justify-center gap-2">
            <Clock className="h-4 w-4" />
            {settings
              ? `${Number(settings.cooldown) / 3600} hour cooldown`
              : "Loading..."}
          </p>
          <p>Tokens are encrypted upon receipt</p>
        </div>
      </div>
    </GlowCard>
  );
}
