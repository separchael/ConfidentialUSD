import { ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Powered by</span>
          <a
            href="https://www.zama.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
          >
            Zama fhEVM
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Sepolia Testnet
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <a
            href="https://docs.zama.ai/protocol"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/zama-ai/fhevm"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
