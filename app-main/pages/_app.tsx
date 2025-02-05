// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";

export default function MyApp({ Component, pageProps }: AppProps) {
  // No MSAL imports or providers here
  return <Component {...pageProps} />;
}
