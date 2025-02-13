import "../styles/globals.css";
import type { AppProps } from "next/app";
import React from "react";
import { MsalProvider } from "@azure/msal-react";
import { MsalInitProvider, useMsalInitialization } from "../context/MsalInitContext";
import { msalInstance } from "../lib/msalConfig";

function AppContent({ Component, pageProps, router }: AppProps) {
  // Wait for MSAL initialization before rendering MsalProvider
  const { initialized } = useMsalInitialization();
  if (!initialized) {
    return <div>Initializing MSAL...</div>;
  }
  return (
    <MsalProvider instance={msalInstance}>
      <Component {...pageProps} router={router} />
    </MsalProvider>
  );
}

export default function MyApp({ Component, pageProps, router }: AppProps) {
  return (
    <MsalInitProvider>
      <AppContent Component={Component} pageProps={pageProps} router={router} />
    </MsalInitProvider>
  );
}