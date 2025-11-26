import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

interface ShimmerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
}

export const ShimmerButton = forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "#22D3EE",
      shimmerSize = "0.1em",
      shimmerDuration = "2s",
      borderRadius = "0.75rem",
      background = "linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden whitespace-nowrap px-6 py-3",
          "text-white font-medium transition-all duration-300",
          "hover:scale-[1.02] hover:shadow-lg hover:shadow-cyan-500/25",
          "active:scale-[0.98]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          className
        )}
        style={{
          borderRadius,
          background,
        }}
        {...props}
      >
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius }}
        >
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: `linear-gradient(90deg, transparent, ${shimmerColor}40, transparent)`,
              backgroundSize: "200% 100%",
            }}
          />
        </div>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";
