import { useState, useEffect } from "react";
import { Copy, Check, Lock } from "lucide-react";
import { cn, shortenAddress, generateCipherDisplay } from "../../lib/utils";

interface CipherBadgeProps {
  handle: string;
  className?: string;
  showCopy?: boolean;
  animated?: boolean;
}

export function CipherBadge({
  handle,
  className,
  showCopy = true,
  animated = true,
}: CipherBadgeProps) {
  const [copied, setCopied] = useState(false);
  const [cipherDisplay, setCipherDisplay] = useState(generateCipherDisplay(8));

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setCipherDisplay(generateCipherDisplay(8));
    }, 150);

    return () => clearInterval(interval);
  }, [animated]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50",
        className
      )}
    >
      <Lock className="h-3 w-3 text-primary" />
      <span className="cipher-text text-sm text-muted-foreground">
        {animated ? cipherDisplay : shortenAddress(handle, 6)}
      </span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-muted transition-colors"
          title="Copy handle"
        >
          {copied ? (
            <Check className="h-3 w-3 text-success" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
      )}
    </div>
  );
}

interface CipherValueProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CipherValue({ className, size = "md" }: CipherValueProps) {
  const [display, setDisplay] = useState("");

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const lengths = {
    sm: 8,
    md: 12,
    lg: 16,
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(generateCipherDisplay(lengths[size]));
    }, 100);

    return () => clearInterval(interval);
  }, [size]);

  return (
    <div
      className={cn(
        "cipher-text font-mono tracking-widest text-muted-foreground",
        sizeClasses[size],
        className
      )}
    >
      {display}
    </div>
  );
}
