import { useEffect, useState } from "react";
import { cn, formatCooldown } from "../../lib/utils";

interface CountdownTimerProps {
  seconds: number;
  onComplete?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CountdownTimer({
  seconds,
  onComplete,
  className,
  size = "md",
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, onComplete]);

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const isReady = remaining <= 0;

  return (
    <div
      className={cn(
        "font-mono tabular-nums tracking-wider",
        sizeClasses[size],
        isReady ? "text-success" : "text-foreground",
        className
      )}
    >
      {formatCooldown(remaining)}
    </div>
  );
}

interface CircularCountdownProps {
  seconds: number;
  maxSeconds: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularCountdown({
  seconds,
  maxSeconds,
  size = 120,
  strokeWidth = 8,
  className,
}: CircularCountdownProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = seconds / maxSeconds;
  const offset = circumference - progress * circumference;

  return (
    <div className={cn("relative inline-flex", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-lg font-semibold tabular-nums">
          {formatCooldown(seconds)}
        </span>
      </div>
    </div>
  );
}
