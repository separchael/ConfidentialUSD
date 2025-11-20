import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { cn, shortenAddress } from "../../lib/utils";

interface AddressDisplayProps {
  address: string;
  className?: string;
  showCopy?: boolean;
  showExplorer?: boolean;
  chars?: number;
}

export function AddressDisplay({
  address,
  className,
  showCopy = true,
  showExplorer = true,
  chars = 4,
}: AddressDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const explorerUrl = `https://sepolia.etherscan.io/address/${address}`;

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <code className="font-mono text-sm text-muted-foreground">
        {shortenAddress(address, chars)}
      </code>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-muted/50 transition-colors"
          title="Copy address"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-success" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
          )}
        </button>
      )}
      {showExplorer && (
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 rounded hover:bg-muted/50 transition-colors"
          title="View on Explorer"
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
        </a>
      )}
    </div>
  );
}
