import { motion } from "framer-motion";
import {
  BookOpen,
  Lock,
  Unlock,
  Send,
  Droplets,
  Shield,
  ExternalLink,
  Code,
  Terminal,
} from "lucide-react";
import { PageContainer } from "../components/layout";
import { GlowCard, GlowCardHeader, GlowCardTitle, GlowCardContent } from "../components/ui/GlowCard";

const sections = [
  {
    id: "overview",
    title: "What is cUSD?",
    icon: BookOpen,
    content: `Confidential USD (cUSD) is a privacy-preserving stablecoin built on Zama's fhEVM.
    Your balance and transfer amounts are encrypted using Fully Homomorphic Encryption (FHE),
    meaning no one can see how much you hold or transfer - not even the blockchain validators.`,
  },
  {
    id: "encrypted-balance",
    title: "Encrypted Balances",
    icon: Lock,
    content: `Your cUSD balance is stored as an encrypted value (called a "cipher handle") on-chain.
    This handle looks like random bytes but actually represents your real balance.
    Only you (with proper authorization) can decrypt and view your actual balance.`,
  },
  {
    id: "decryption",
    title: "How to Decrypt",
    icon: Unlock,
    content: `To view your actual balance:
    1. Click "Make Decryptable" to authorize decryption
    2. Wait for the transaction to confirm
    3. Use the Zama relayer SDK to perform off-chain decryption
    4. The decrypted value is verified cryptographically`,
  },
  {
    id: "transfers",
    title: "Encrypted Transfers",
    icon: Send,
    content: `When transferring cUSD:
    1. Generate an encrypted amount using the FHE SDK
    2. Submit the encrypted value along with a zero-knowledge proof
    3. The contract verifies the proof and performs the transfer
    4. If you don't have enough balance, the transfer amount becomes 0 (fail-closed design)`,
  },
  {
    id: "faucet",
    title: "Using the Faucet",
    icon: Droplets,
    content: `The faucet provides free cUSD tokens for testing:
    • Claim 1,000 cUSD every 24 hours
    • Tokens are encrypted immediately upon receipt
    • No special setup required - just connect your wallet and claim`,
  },
  {
    id: "security",
    title: "Security Model",
    icon: Shield,
    content: `cUSD uses a fail-closed security model:
    • Invalid operations default to safe values (e.g., 0 transfer)
    • All FHE operations are verified on-chain
    • Decryption requires explicit authorization
    • Only the contract owner can mint/burn tokens`,
  },
];

const codeExamples = [
  {
    title: "Generate Encrypted Amount",
    language: "typescript",
    code: `import { createInstance } from "@zama-fhe/relayer-sdk";

const fhe = await createInstance({ network: "sepolia" });
const encrypted = await fhe.encrypt64(1000000000n); // 1000 cUSD
const { handle, inputProof } = encrypted;`,
  },
  {
    title: "Perform Transfer",
    language: "typescript",
    code: `const tx = await contract.transferReplica(
  recipientAddress,
  handle,        // encrypted amount
  inputProof     // zero-knowledge proof
);
await tx.wait();`,
  },
  {
    title: "Decrypt Balance",
    language: "typescript",
    code: `// First, make balance decryptable
await contract.makeBalanceDecryptable();

// Then use relayer SDK
const decrypted = await fhe.publicDecrypt(balanceHandle);
console.log("Balance:", decrypted.toString());`,
  },
];

export function Guide() {
  return (
    <PageContainer
      title="User Guide"
      description="Learn how to use Confidential USD"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlowCard>
                  <GlowCardHeader>
                    <GlowCardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      {section.title}
                    </GlowCardTitle>
                  </GlowCardHeader>
                  <GlowCardContent>
                    <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                      {section.content}
                    </p>
                  </GlowCardContent>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>

        {/* Sidebar - Code Examples */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlowCard>
              <GlowCardHeader>
                <GlowCardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  Code Examples
                </GlowCardTitle>
              </GlowCardHeader>
              <GlowCardContent className="space-y-6">
                {codeExamples.map((example) => (
                  <div key={example.title}>
                    <p className="text-sm font-medium text-foreground mb-2">
                      {example.title}
                    </p>
                    <pre className="p-3 rounded-lg bg-muted/50 border border-border/50 overflow-x-auto">
                      <code className="text-xs text-muted-foreground font-mono">
                        {example.code}
                      </code>
                    </pre>
                  </div>
                ))}
              </GlowCardContent>
            </GlowCard>
          </motion.div>

          {/* Resources */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlowCard>
              <GlowCardHeader>
                <GlowCardTitle className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  Resources
                </GlowCardTitle>
              </GlowCardHeader>
              <GlowCardContent className="space-y-3">
                <ResourceLink
                  href="https://docs.zama.ai/protocol"
                  title="Zama Protocol Docs"
                />
                <ResourceLink
                  href="https://github.com/zama-ai/fhevm"
                  title="fhEVM GitHub"
                />
                <ResourceLink
                  href="https://docs.zama.ai/protocol/solidity-guides"
                  title="Solidity Guides"
                />
                <ResourceLink
                  href="https://www.zama.ai/"
                  title="Zama Website"
                />
              </GlowCardContent>
            </GlowCard>
          </motion.div>
        </div>
      </div>
    </PageContainer>
  );
}

function ResourceLink({ href, title }: { href: string; title: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/50 transition-colors group"
    >
      <span className="text-sm text-foreground">{title}</span>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </a>
  );
}
