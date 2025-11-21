import { useState } from "react";
import { Send, AlertCircle, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { GlowCard, GlowCardHeader, GlowCardTitle } from "../ui/GlowCard";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { isValidAddress } from "../../lib/utils";
import { useTransfer } from "../../hooks/useStablecoin";
import { useFHE } from "../../hooks/useFHE";
import type { Address } from "../../types";

interface TransferFormProps {
  className?: string;
}

export function TransferForm({ className }: TransferFormProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { transfer, isPending, isConfirming, isSuccess, error } = useTransfer();
  const { encryptAmount, isEncrypting } = useFHE();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!recipient) {
      newErrors.recipient = "Recipient address is required";
    } else if (!isValidAddress(recipient)) {
      newErrors.recipient = "Invalid Ethereum address";
    }

    if (!amount) {
      newErrors.amount = "Amount is required";
    } else {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        newErrors.amount = "Amount must be a positive number";
      } else if (parsedAmount > 18446744073.709551) {
        // Max uint64 with 6 decimals
        newErrors.amount = "Amount exceeds maximum";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // Parse amount to bigint with 6 decimals
      const amountParts = amount.split(".");
      const integerPart = amountParts[0] || "0";
      const fractionalPart = (amountParts[1] || "").padEnd(6, "0").slice(0, 6);
      const amountBigInt = BigInt(integerPart + fractionalPart);

      console.log("[TransferForm] Encrypting amount:", amountBigInt.toString());

      // Encrypt the amount using FHE SDK
      const { encryptedAmount, inputProof } = await encryptAmount(amountBigInt);

      console.log("[TransferForm] Encrypted amount:", encryptedAmount);
      console.log("[TransferForm] Input proof length:", inputProof.length);

      // Send the transfer transaction
      await transfer(
        recipient as Address,
        encryptedAmount,
        inputProof
      );

      // Clear form on success
      setRecipient("");
      setAmount("");
    } catch (err) {
      console.error("Transfer failed:", err);
    }
  };

  const isLoading = isPending || isConfirming || isEncrypting;

  return (
    <GlowCard className={className}>
      <GlowCardHeader>
        <GlowCardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Send cUSD
        </GlowCardTitle>
      </GlowCardHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Success Message */}
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-success/20 border border-success/30"
          >
            <p className="text-success text-sm font-medium">
              Transfer submitted successfully!
            </p>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-destructive/20 border border-destructive/30 flex items-start gap-3"
          >
            <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-destructive text-sm font-medium">
                Transfer failed
              </p>
              <p className="text-destructive/80 text-xs mt-1">
                {error.message}
              </p>
            </div>
          </motion.div>
        )}

        {/* Recipient Address */}
        <Input
          label="Recipient Address"
          placeholder="0x..."
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          error={errors.recipient}
          className="font-mono"
        />

        {/* Amount */}
        <div className="space-y-2">
          <Input
            label="Amount"
            type="number"
            step="0.000001"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            error={errors.amount}
          />
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Amount will be encrypted before sending
          </p>
        </div>

        {/* Encryption Info */}
        <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-xs text-primary">
            Your transfer amount is encrypted using Fully Homomorphic Encryption (FHE).
            Only you and the recipient can know the actual amount.
          </p>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-xs text-warning">
            If you don't have enough balance, the transfer will send 0 tokens
            (fail-closed design for privacy).
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          loading={isLoading}
          className="w-full"
          size="lg"
        >
          {isEncrypting ? (
            <>
              <Lock className="h-4 w-4 animate-pulse" />
              Encrypting...
            </>
          ) : isLoading ? (
            <>
              <Send className="h-4 w-4" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Transfer
            </>
          )}
        </Button>
      </form>
    </GlowCard>
  );
}
