// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "../lib/msalConfig";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

export default MyApp;
