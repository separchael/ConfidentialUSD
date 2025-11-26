import { Play, Shield, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Zap, Users, Building2 } from "lucide-react";

export function Doc() {
  return (
    <main className="flex-1 container py-8 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="cUSD Logo" className="h-24 w-24" />
        </div>
        <h1 className="text-4xl font-bold gradient-text">
          Confidential USD (cUSD)
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          A privacy-preserving stablecoin powered by Fully Homomorphic Encryption (FHE),
          enabling confidential transactions while maintaining regulatory compliance.
        </p>
      </section>

      {/* Demo Video Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Play className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Demo Video</h2>
        </div>
        <div className="card p-0 overflow-hidden">
          <video
            controls
            className="w-full aspect-video bg-black"
            poster="/demo-poster.png"
          >
            <source src="/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Watch how cUSD enables private stablecoin transactions with FHE encryption
        </p>
      </section>

      {/* Why Private Stablecoin */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Why Privacy-Preserving Stablecoin?</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Eye className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold">The Problem</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Traditional stablecoins expose all transaction data on-chain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Balances and transfer amounts are visible to everyone</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Competitors can track business transactions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Personal financial privacy is compromised</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Salary payments reveal sensitive compensation data</span>
              </li>
            </ul>
          </div>

          <div className="card space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <EyeOff className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold">The Solution</h3>
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                <span>All balances are encrypted using FHE</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                <span>Transfer amounts remain confidential on-chain</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                <span>Only account owners can decrypt their own balance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                <span>Computations happen on encrypted data</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-1 flex-shrink-0" />
                <span>Regulatory compliance through selective disclosure</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Use Cases</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="card space-y-3">
            <div className="p-3 rounded-lg bg-primary/10 w-fit">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Enterprise Payments</h3>
            <p className="text-muted-foreground text-sm">
              Businesses can make payments without revealing transaction amounts to competitors
              or the public, protecting sensitive financial operations.
            </p>
          </div>

          <div className="card space-y-3">
            <div className="p-3 rounded-lg bg-primary/10 w-fit">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Payroll & HR</h3>
            <p className="text-muted-foreground text-sm">
              Pay employees in stablecoins while keeping salary information confidential,
              protecting both employer and employee privacy.
            </p>
          </div>

          <div className="card space-y-3">
            <div className="p-3 rounded-lg bg-primary/10 w-fit">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">Personal Finance</h3>
            <p className="text-muted-foreground text-sm">
              Individuals can hold and transfer stablecoins without exposing their
              wealth or transaction history to the world.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Lock className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">How It Works</h2>
        </div>

        <div className="card">
          <div className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                1
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Connect Wallet</h3>
                <p className="text-muted-foreground text-sm">
                  Connect your Web3 wallet (MetaMask, Rainbow, etc.) to the Sepolia testnet.
                  The app will automatically prompt you to switch networks if needed.
                </p>
              </div>
            </div>

            <div className="ml-5 border-l-2 border-border h-4"></div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                2
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Claim from Faucet</h3>
                <p className="text-muted-foreground text-sm">
                  Visit the Faucet page to claim free cUSD tokens for testing. You can claim
                  1,000 cUSD every 24 hours. Tokens are immediately encrypted upon receipt.
                </p>
              </div>
            </div>

            <div className="ml-5 border-l-2 border-border h-4"></div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                3
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">View Encrypted Balance</h3>
                <p className="text-muted-foreground text-sm">
                  Your balance is stored as an encrypted ciphertext on-chain. Only you can
                  decrypt it by clicking "Decrypt Balance" in the Wallet page.
                </p>
              </div>
            </div>

            <div className="ml-5 border-l-2 border-border h-4"></div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                4
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Transfer Privately</h3>
                <p className="text-muted-foreground text-sm">
                  Send cUSD to any address. The transfer amount is encrypted before being
                  sent to the contract. Balance checks happen on encrypted data using FHE.
                </p>
              </div>
            </div>

            <div className="ml-5 border-l-2 border-border h-4"></div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                5
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Track Transactions</h3>
                <p className="text-muted-foreground text-sm">
                  View your transaction history in the Wallet page. While events are visible
                  on-chain, the actual amounts transferred remain encrypted and private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold">Technical Architecture</h2>
        </div>

        <div className="card space-y-4">
          <h3 className="font-semibold text-lg">Powered by Zama fhEVM</h3>
          <p className="text-muted-foreground">
            cUSD is built on Zama's fhEVM (Fully Homomorphic Encryption Virtual Machine),
            which enables computations on encrypted data directly on the blockchain.
          </p>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="font-medium">FHE Operations Used</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <code className="text-xs bg-background px-1 rounded">FHE.asEuint64</code> - Encrypt plaintext values
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <code className="text-xs bg-background px-1 rounded">FHE.add</code> - Add encrypted balances
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <code className="text-xs bg-background px-1 rounded">FHE.sub</code> - Subtract encrypted amounts
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <code className="text-xs bg-background px-1 rounded">FHE.le</code> - Compare encrypted values
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  <code className="text-xs bg-background px-1 rounded">FHE.select</code> - Conditional selection
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <h4 className="font-medium">Security Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Fail-closed design for balance checks
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Permission-based decryption
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Owner-controlled minting/burning
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Encrypted input verification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-400" />
                  Self-relaying decryption model
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contract Info */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Contract Information</h2>
        <div className="card">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-muted-foreground min-w-32">Network:</span>
              <span className="font-mono">Ethereum Sepolia Testnet</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-muted-foreground min-w-32">Contract:</span>
              <a
                href="https://sepolia.etherscan.io/address/0xE8618c9CAb16C6A8DeFE84D9E3e0b2Cc86c6C02e"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-primary hover:underline break-all"
              >
                0xE8618c9CAb16C6A8DeFE84D9E3e0b2Cc86c6C02e
              </a>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-muted-foreground min-w-32">Token:</span>
              <span>cUSD (Confidential USD)</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-muted-foreground min-w-32">Decimals:</span>
              <span>6</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center space-y-4 py-8">
        <h2 className="text-2xl font-semibold">Ready to Try?</h2>
        <p className="text-muted-foreground">
          Experience private stablecoin transactions with cUSD on Sepolia testnet.
        </p>
        <div className="flex justify-center gap-4">
          <a href="/faucet" className="btn-primary inline-flex items-center gap-2">
            Get Test Tokens
            <ArrowRight className="h-4 w-4" />
          </a>
          <a href="/wallet" className="btn-secondary inline-flex items-center gap-2">
            Open Wallet
          </a>
        </div>
      </section>
    </main>
  );
}
