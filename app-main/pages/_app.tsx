import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { MsalProvider, useIsAuthenticated } from "@azure/msal-react";
import { msalInstance, initializeMsalInstance } from "../lib/msalConfig";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      const returnUrl = router.asPath;
      router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`);
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
};

function MyApp({ Component, pageProps, router }: AppProps) {
  const [isMsalReady, setMsalReady] = useState(false);
  const publicRoutes = ["/login", "/public"];
  const isPublicRoute = publicRoutes.includes(router.pathname);

  useEffect(() => {
    // Initialize MSAL instance
    initializeMsalInstance().then(() => {
      setMsalReady(true);
    });
  }, []);

  if (!isMsalReady) {
    return <div>Loading...</div>; // Show a loading state while MSAL is initializing
  }

  return (
    <MsalProvider instance={msalInstance}>
      {isPublicRoute ? (
        <Component {...pageProps} />
      ) : (
        <AuthenticatedRoute>
          <Component {...pageProps} />
        </AuthenticatedRoute>
      )}
    </MsalProvider>
  );
}

export default MyApp;
