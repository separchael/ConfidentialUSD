import { useState } from "react";
import { Coins, Flame, Settings, UserCog, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { GlowCard, GlowCardHeader, GlowCardTitle } from "../ui/GlowCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/Tabs";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { isValidAddress, formatAmount, parseAmount } from "../../lib/utils";
import {
  useMint,
  useBurn,
  useUpdateFaucetSettings,
  useTransferOwnership,
  useFaucetSettings,
} from "../../hooks/useStablecoin";
import type { Address } from "../../types";

interface IssuerActionsProps {
  className?: string;
}

export function IssuerActions({ className }: IssuerActionsProps) {
  return (
    <GlowCard className={className} glowColor="warning">
      <GlowCardHeader>
        <GlowCardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-warning" />
          Issuer Panel
        </GlowCardTitle>
        <span className="badge badge-warning">Owner Only</span>
      </GlowCardHeader>

      <Tabs defaultValue="mint" className="mt-4">
        <TabsList className="w-full grid grid-cols-4 gap-1">
          <TabsTrigger value="mint">
            <Coins className="h-4 w-4 mr-2" />
            Mint
          </TabsTrigger>
          <TabsTrigger value="burn">
            <Flame className="h-4 w-4 mr-2" />
            Burn
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Faucet
          </TabsTrigger>
          <TabsTrigger value="transfer">
            <UserCog className="h-4 w-4 mr-2" />
            Owner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mint" className="mt-6">
          <MintForm />
        </TabsContent>

        <TabsContent value="burn" className="mt-6">
          <BurnForm />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <FaucetSettingsForm />
        </TabsContent>

        <TabsContent value="transfer" className="mt-6">
          <TransferOwnershipForm />
        </TabsContent>
      </Tabs>
    </GlowCard>
  );
}

function MintForm() {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { mint, isPending, isConfirming, isSuccess, error } = useMint();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!recipient || !isValidAddress(recipient)) {
      newErrors.recipient = "Invalid address";
    }
    if (!amount || isNaN(Number(amount))) {
      newErrors.amount = "Invalid amount";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const amountBigInt = parseAmount(amount, 6);
    await mint(recipient as Address, amountBigInt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSuccess && (
        <SuccessMessage message="Tokens minted successfully!" />
      )}
      {error && <ErrorMessage message={error.message} />}

      <Input
        label="Recipient Address"
        placeholder="0x..."
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        error={errors.recipient}
      />

      <Input
        label="Amount (cUSD)"
        placeholder="1000.000000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
        hint={amount ? `= ${parseAmount(amount || "0", 6).toString()} (raw)` : undefined}
      />

      <WarningBanner message="This will mint new tokens and increase total supply" />

      <Button
        type="submit"
        loading={isPending || isConfirming}
        className="w-full"
      >
        <Coins className="h-4 w-4" />
        Mint Tokens
      </Button>
    </form>
  );
}

function BurnForm() {
  const [from, setFrom] = useState("");
  const [amount, setAmount] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { burn, isPending, isConfirming, isSuccess, error } = useBurn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!from || !isValidAddress(from)) {
      newErrors.from = "Invalid address";
    }
    if (!amount || isNaN(Number(amount))) {
      newErrors.amount = "Invalid amount";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const amountBigInt = parseAmount(amount, 6);
    await burn(from as Address, amountBigInt);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSuccess && (
        <SuccessMessage message="Tokens burned successfully!" />
      )}
      {error && <ErrorMessage message={error.message} />}

      <Input
        label="Burn From Address"
        placeholder="0x..."
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        error={errors.from}
      />

      <Input
        label="Amount (cUSD)"
        placeholder="1000.000000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amount}
      />

      <WarningBanner message="Burn amount will be truncated to 0 if insufficient balance" />

      <Button
        type="submit"
        loading={isPending || isConfirming}
        variant="destructive"
        className="w-full"
      >
        <Flame className="h-4 w-4" />
        Burn Tokens
      </Button>
    </form>
  );
}

function FaucetSettingsForm() {
  const { data: currentSettings } = useFaucetSettings();
  const [amount, setAmount] = useState("");
  const [cooldown, setCooldown] = useState("");
  const { updateSettings, isPending, isConfirming, isSuccess, error } =
    useUpdateFaucetSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAmount = amount ? parseAmount(amount, 6) : currentSettings?.amount || 0n;
    const newCooldown = cooldown ? BigInt(Number(cooldown) * 3600) : currentSettings?.cooldown || 0n;
    await updateSettings(newAmount, newCooldown);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSuccess && (
        <SuccessMessage message="Faucet settings updated!" />
      )}
      {error && <ErrorMessage message={error.message} />}

      <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
        <p className="text-sm text-muted-foreground mb-2">Current Settings</p>
        <p className="text-sm">
          Amount: {currentSettings ? formatAmount(currentSettings.amount, 6) : "..."} cUSD
        </p>
        <p className="text-sm">
          Cooldown: {currentSettings ? Number(currentSettings.cooldown) / 3600 : "..."} hours
        </p>
      </div>

      <Input
        label="New Amount (cUSD)"
        placeholder="1000.000000"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        hint="Leave empty to keep current"
      />

      <Input
        label="New Cooldown (hours)"
        placeholder="24"
        value={cooldown}
        onChange={(e) => setCooldown(e.target.value)}
        hint="Leave empty to keep current"
      />

      <Button
        type="submit"
        loading={isPending || isConfirming}
        variant="secondary"
        className="w-full"
      >
        <Settings className="h-4 w-4" />
        Update Settings
      </Button>
    </form>
  );
}

function TransferOwnershipForm() {
  const [newOwner, setNewOwner] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { transferOwnership, isPending, isConfirming, isSuccess, error } =
    useTransferOwnership();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!newOwner || !isValidAddress(newOwner)) {
      newErrors.newOwner = "Invalid address";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    await transferOwnership(newOwner as Address);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isSuccess && (
        <SuccessMessage message="Ownership transferred successfully!" />
      )}
      {error && <ErrorMessage message={error.message} />}

      <Input
        label="New Owner Address"
        placeholder="0x..."
        value={newOwner}
        onChange={(e) => setNewOwner(e.target.value)}
        error={errors.newOwner}
      />

      <WarningBanner
        message="This action is irreversible! You will lose owner privileges."
        variant="error"
      />

      <Button
        type="submit"
        loading={isPending || isConfirming}
        variant="destructive"
        className="w-full"
      >
        <UserCog className="h-4 w-4" />
        Transfer Ownership
      </Button>
    </form>
  );
}

function SuccessMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg bg-success/20 border border-success/30"
    >
      <p className="text-success text-sm">{message}</p>
    </motion.div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg bg-destructive/20 border border-destructive/30"
    >
      <p className="text-destructive text-sm">{message}</p>
    </motion.div>
  );
}

function WarningBanner({
  message,
  variant = "warning",
}: {
  message: string;
  variant?: "warning" | "error";
}) {
  const colors =
    variant === "error"
      ? "bg-destructive/10 border-destructive/20 text-destructive"
      : "bg-warning/10 border-warning/20 text-warning";

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg border ${colors}`}>
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <p className="text-xs">{message}</p>
    </div>
  );
}
