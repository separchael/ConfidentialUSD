import { useState, useEffect, useRef } from "react";
import { Lock, Unlock, Copy, Check, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlowCard, GlowCardHeader, GlowCardTitle } from "../ui/GlowCard";
import { CipherValue } from "../ui/CipherBadge";
import { Button } from "../ui/Button";
import { cn, formatAmount, shortenAddress } from "../../lib/utils";
import { useMakeBalanceDecryptable } from "../../hooks/useStablecoin";

interface CipherBalanceCardProps {
  handle?: string;
  isDecrypting?: boolean;
  decryptedValue?: bigint;
  decimals?: number;
  symbol?: string;
  onDecrypt?: () => void;
  className?: string;
}

export function CipherBalanceCard({
  handle,
  isDecrypting = false,
  decryptedValue,
  decimals = 6,
  symbol = "cUSD",
  onDecrypt,
  className,
}: CipherBalanceCardProps) {
  const [copied, setCopied] = useState(false);
  const { makeDecryptable, isPending, isConfirming, isSuccess } = useMakeBalanceDecryptable();
  const hasAutoDecrypted = useRef(false);

  // Auto-trigger decryption when makeDecryptable transaction succeeds
  useEffect(() => {
    if (isSuccess && onDecrypt && !hasAutoDecrypted.current && !decryptedValue) {
      console.log('[CipherBalanceCard] Make decryptable succeeded, auto-triggering decrypt...');
      hasAutoDecrypted.current = true;
      // Small delay to ensure chain state is updated
      setTimeout(() => {
        onDecrypt();
      }, 1000);
    }
  }, [isSuccess, onDecrypt, decryptedValue]);

  // Reset auto-decrypt flag when decrypted value is cleared
  useEffect(() => {
    if (!decryptedValue) {
      hasAutoDecrypted.current = false;
    }
  }, [decryptedValue]);

  const isDecrypted = decryptedValue !== undefined;
  const isLoading = isDecrypting || isPending || isConfirming;

  const handleCopyHandle = async () => {
    if (!handle) return;
    await navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMakeDecryptable = async () => {
    await makeDecryptable();
  };

  return (
    <GlowCard className={cn("relative overflow-hidden", className)}>
      <GlowCardHeader>
        <GlowCardTitle className="flex items-center gap-2">
          {isDecrypted ? (
            <Unlock className="h-5 w-5 text-success" />
          ) : (
            <Lock className="h-5 w-5 text-primary" />
          )}
          Encrypted Balance
        </GlowCardTitle>
        <span
          className={cn(
            "badge",
            isDecrypted ? "badge-success" : "badge-info"
          )}
        >
          {isDecrypted ? "Decrypted" : "Encrypted"}
        </span>
      </GlowCardHeader>

      <div className="space-y-6">
        {/* Balance Display */}
        <div className="text-center py-4">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                <div className="h-12 w-48 mx-auto rounded-lg shimmer" />
                <p className="text-sm text-muted-foreground">
                  {isPending ? "Confirming transaction..." : "Decrypting..."}
                </p>
              </motion.div>
            ) : isDecrypted ? (
              <motion.div
                key="decrypted"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <span className="text-4xl font-bold gradient-text">
                  {formatAmount(decryptedValue, decimals)}
                </span>
                <span className="text-2xl font-medium text-muted-foreground ml-2">
                  {symbol}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="encrypted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CipherValue size="lg" />
                <p className="text-sm text-muted-foreground mt-2">
                  Balance is encrypted
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Handle Display */}
        {handle && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Cipher Handle
                </p>
                <code className="text-sm font-mono text-foreground">
                  {shortenAddress(handle, 8)}
                </code>
              </div>
              <button
                onClick={handleCopyHandle}
                className="p-2 rounded-lg hover:bg-muted/50 transition-colors"
                title="Copy handle"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Copy className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isDecrypted && (
            <Button
              onClick={handleMakeDecryptable}
              loading={isLoading}
              disabled={!onDecrypt}
              className="flex-1"
            >
              {isPending || isConfirming ? (
                <>
                  <Zap className="h-4 w-4 animate-pulse" />
                  Authorizing...
                </>
              ) : isDecrypting ? (
                <>
                  <Unlock className="h-4 w-4 animate-pulse" />
                  Decrypting...
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4" />
                  Decrypt Balance
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </GlowCard>
  );
}
