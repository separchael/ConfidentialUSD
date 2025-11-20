import { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "cyan" | "primary" | "success" | "warning";
  hoverable?: boolean;
}

const glowColors = {
  cyan: "hover:shadow-cyan-500/20",
  primary: "hover:shadow-sky-500/20",
  success: "hover:shadow-emerald-500/20",
  warning: "hover:shadow-amber-500/20",
};

export function GlowCard({
  children,
  className,
  glowColor = "cyan",
  hoverable = true,
}: GlowCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-xl p-6",
        hoverable && [
          "transition-all duration-300",
          "hover:border-border",
          "hover:shadow-lg",
          glowColors[glowColor],
        ],
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface GlowCardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function GlowCardHeader({ children, className }: GlowCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

interface GlowCardTitleProps {
  children: ReactNode;
  className?: string;
}

export function GlowCardTitle({ children, className }: GlowCardTitleProps) {
  return (
    <h3 className={cn("text-lg font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}

interface GlowCardContentProps {
  children: ReactNode;
  className?: string;
}

export function GlowCardContent({ children, className }: GlowCardContentProps) {
  return <div className={cn("", className)}>{children}</div>;
}
