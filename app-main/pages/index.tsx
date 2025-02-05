// pages/index.tsx
import dynamic from "next/dynamic";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "../lib/msalConfig";
import { MsalInitProvider } from "../context/MsalInitContext";

// Dynamically import the real HomePage to disable SSR
const HomePage = dynamic(() => import("../components/HomePage"), {
  ssr: false,
});

export default function Index() {
  return (
    <MsalProvider instance={msalInstance}>
      {/* If you need to await instance.initialize(), wrap with your MsalInitProvider */}
      <MsalInitProvider>
        <HomePage />
      </MsalInitProvider>
    </MsalProvider>
  );
}
