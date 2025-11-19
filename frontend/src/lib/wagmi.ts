import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Confidential USD",
  projectId: "b3c6d8f9a1e2d4c5b6a7e8f9d0c1b2a3", // Demo project ID
  chains: [sepolia],
  ssr: false,
});

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}
