// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "../lib/msalConfig";
import AuthWrapper from "../components/AuthWrapper";

/**
 * The _app.tsx file is the root of your Next.js app. 
 * Wrapping everything in MsalProvider ensures all child components
 * can use the MSAL React hooks. AuthWrapper waits for msalInstance.initialize().
 */
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <MsalProvider instance={msalInstance}>
      <AuthWrapper>
        <Component {...pageProps} />
      </AuthWrapper>
    </MsalProvider>
  );
}

export default MyApp;
