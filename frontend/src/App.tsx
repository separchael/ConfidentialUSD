import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { config } from "./lib/wagmi";
import { Header, Footer } from "./components/layout";
import { AnimatedGridPattern } from "./components/effects";
import { Toaster } from "./components/ui/Toaster";
import { Dashboard, Wallet, Faucet, Issuer, Guide, Doc } from "./pages";
import { useContractEvents } from "./hooks/useContractEvents";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Component that uses hooks inside providers
function AppContent() {
  // Watch contract events and add to store
  useContractEvents();

  return (
    <BrowserRouter>
      <div className="relative min-h-screen flex flex-col">
        {/* Background Effects */}
        <AnimatedGridPattern className="fixed inset-0 -z-10 opacity-50" />

        {/* Header */}
        <Header />

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/faucet" element={<Faucet />} />
          <Route path="/issuer" element={<Issuer />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/doc" element={<Doc />} />
        </Routes>

        {/* Footer */}
        <Footer />

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#06b6d4",
            accentColorForeground: "white",
            borderRadius: "medium",
          })}
        >
          <AppContent />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
