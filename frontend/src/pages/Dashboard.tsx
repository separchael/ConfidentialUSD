import { motion } from "framer-motion";
import { Lock, Coins, Droplets, Activity } from "lucide-react";
import { PageContainer } from "../components/layout";
import { GlowCard, GlowCardHeader, GlowCardTitle, GlowCardContent } from "../components/ui/GlowCard";
import { CipherValue } from "../components/ui/CipherBadge";
import { EventTimeline } from "../components/features/EventTimeline";
import { useAccount } from "wagmi";
import {
  useBalance,
  useTotalSupply,
  useFaucetSettings,
  useFaucetCooldown,
  useTokenInfo,
} from "../hooks/useStablecoin";
import { useAppStore } from "../stores/useAppStore";
import { formatAmount, formatCooldown } from "../lib/utils";

export function Dashboard() {
  const { address } = useAccount();
  const { data: balance } = useBalance(address);
  const { data: totalSupply } = useTotalSupply();
  const { data: faucetSettings } = useFaucetSettings();
  const { data: cooldown } = useFaucetCooldown(address);
  const { data: tokenInfo } = useTokenInfo();
  const { recentEvents } = useAppStore();

  const stats = [
    {
      title: "Total Supply",
      icon: Coins,
      value: totalSupply,
      encrypted: true,
      color: "primary",
    },
    {
      title: "Your Balance",
      icon: Lock,
      value: balance,
      encrypted: true,
      color: "cyan",
    },
    {
      title: "Faucet Amount",
      icon: Droplets,
      value: faucetSettings?.amount,
      encrypted: false,
      color: "success",
    },
  ];

  return (
    <PageContainer>
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="gradient-text">Confidential USD</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          The Privacy-First Stablecoin powered by Fully Homomorphic Encryption
        </p>
        {tokenInfo && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="badge badge-info">{tokenInfo.symbol}</span>
            <span className="text-sm text-muted-foreground">
              {tokenInfo.decimals} decimals
            </span>
          </div>
        )}
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlowCard>
                <GlowCardHeader>
                  <GlowCardTitle className="flex items-center gap-2 text-base">
                    <Icon className={`h-5 w-5 text-${stat.color}`} />
                    {stat.title}
                  </GlowCardTitle>
                  {stat.encrypted && (
                    <span className="badge badge-info text-xs">Encrypted</span>
                  )}
                </GlowCardHeader>
                <GlowCardContent>
                  <div className="mt-2">
                    {stat.encrypted ? (
                      <CipherValue size="md" />
                    ) : stat.value !== undefined && stat.value !== null ? (
                      <p className="text-3xl font-bold text-foreground">
                        {formatAmount(BigInt(stat.value.toString()), 6)}
                        <span className="text-lg text-muted-foreground ml-2">
                          cUSD
                        </span>
                      </p>
                    ) : (
                      <div className="h-9 w-32 rounded shimmer" />
                    )}
                  </div>
                </GlowCardContent>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>

      {/* Faucet Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faucet Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlowCard className="h-full">
            <GlowCardHeader>
              <GlowCardTitle className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-cyan-400" />
                Faucet Status
              </GlowCardTitle>
            </GlowCardHeader>
            <GlowCardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Claim Amount</p>
                <p className="text-2xl font-bold">
                  {faucetSettings
                    ? formatAmount(faucetSettings.amount, 6)
                    : "..."}
                  <span className="text-sm text-muted-foreground ml-1">
                    cUSD
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cooldown Period</p>
                <p className="text-lg font-medium">
                  {faucetSettings
                    ? `${Number(faucetSettings.cooldown) / 3600} hours`
                    : "..."}
                </p>
              </div>
              {address && cooldown !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    Your Next Claim
                  </p>
                  <p
                    className={`text-lg font-medium ${
                      cooldown === 0n ? "text-success" : "text-foreground"
                    }`}
                  >
                    {cooldown === 0n
                      ? "Available Now!"
                      : formatCooldown(Number(cooldown))}
                  </p>
                </div>
              )}
            </GlowCardContent>
          </GlowCard>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <GlowCard className="h-full">
            <GlowCardHeader>
              <GlowCardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </GlowCardTitle>
            </GlowCardHeader>
            <GlowCardContent>
              <EventTimeline
                events={recentEvents.slice(0, 5)}
                className="max-h-[300px] overflow-y-auto"
              />
            </GlowCardContent>
          </GlowCard>
        </motion.div>
      </div>
    </PageContainer>
  );
}
