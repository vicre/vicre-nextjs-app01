// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "../lib/msalConfig";

// Import our MsalInitProvider
import { MsalInitProvider } from "../context/MsalInitContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MsalProvider instance={msalInstance}>
      {/* This provider calls instance.initialize() and exposes `initialized` */}
      <MsalInitProvider>
        <Component {...pageProps} />
      </MsalInitProvider>
    </MsalProvider>
  );
}

export default MyApp;
