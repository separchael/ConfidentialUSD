import { Coins, Send, Flame, Droplets, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { cn, shortenAddress, getTimeAgo } from "../../lib/utils";
import type { TransactionEvent } from "../../types";

interface EventTimelineProps {
  events: TransactionEvent[];
  className?: string;
}

const eventConfig = {
  mint: {
    icon: Coins,
    color: "text-success",
    bgColor: "bg-success/20",
    label: "Mint",
  },
  burn: {
    icon: Flame,
    color: "text-destructive",
    bgColor: "bg-destructive/20",
    label: "Burn",
  },
  transfer: {
    icon: Send,
    color: "text-primary",
    bgColor: "bg-primary/20",
    label: "Transfer",
  },
  faucet: {
    icon: Droplets,
    color: "text-cyan-400",
    bgColor: "bg-cyan-400/20",
    label: "Faucet",
  },
};

export function EventTimeline({ events, className }: EventTimelineProps) {
  if (events.length === 0) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {events.map((event, index) => {
        const config = eventConfig[event.type];
        const Icon = config.icon;

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border/50 hover:border-border transition-colors"
          >
            {/* Icon */}
            <div
              className={cn(
                "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                config.bgColor
              )}
            >
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    config.color
                  )}
                >
                  {config.label}
                </span>
                {event.to && (
                  <>
                    <span className="text-muted-foreground">→</span>
                    <code className="text-sm text-foreground font-mono">
                      {shortenAddress(event.to)}
                    </code>
                  </>
                )}
              </div>
              {event.from && event.type === "transfer" && (
                <p className="text-xs text-muted-foreground mt-1">
                  From: {shortenAddress(event.from)}
                </p>
              )}
            </div>

            {/* Amount & Time */}
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-medium text-foreground">
                {event.amount !== undefined ? (
                  <span className={event.type === "burn" ? "text-destructive" : "text-success"}>
                    {event.type === "burn" ? "-" : "+"}??? cUSD
                  </span>
                ) : (
                  <span className="text-muted-foreground">Encrypted</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getTimeAgo(event.timestamp)}
              </p>
            </div>

            {/* Explorer Link */}
            <a
              href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-2 rounded-lg hover:bg-muted/50 transition-colors"
              title="View on Explorer"
            >
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </a>
          </motion.div>
        );
      })}
    </div>
  );
}

interface EventTimelineItemProps {
  event: TransactionEvent;
}

export function EventTimelineItem({ event }: EventTimelineItemProps) {
  const config = eventConfig[event.type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center",
          config.bgColor
        )}
      >
        <Icon className={cn("h-4 w-4", config.color)} />
      </div>
      <div className="flex-1">
        <span className={cn("text-sm font-medium", config.color)}>
          {config.label}
        </span>
        {event.to && (
          <span className="text-sm text-muted-foreground ml-2">
            {shortenAddress(event.to, 4)}
          </span>
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {getTimeAgo(event.timestamp)}
      </span>
    </div>
  );
}
