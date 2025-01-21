// components/AuthWrapper.tsx
import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

/**
 * Wraps all pages/components to ensure the MSAL instance is
 * initialized before we call .handleRedirectPromise(), .loginRedirect(), etc.
 */
const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance } = useMsal();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Only run on the client. If (typeof window === "undefined"), skip
    if (typeof window === "undefined") return;

    instance
      .initialize() // <-- MSAL 4.x requires this
      .then(() => {
        console.log("MSAL initialized successfully.");
        setInitialized(true);
      })
      .catch((err) => {
        console.error("Error initializing MSAL:", err);
      });
  }, [instance]);

  if (!initialized) {
    // Show a simple loading indicator until MSAL is ready
    return <div>Initializing authentication...</div>;
  }

  // Now that MSAL is initialized, any MSAL React hooks/calls are safe
  return <>{children}</>;
};

export default AuthWrapper;
