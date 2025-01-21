// components/AuthWrapper.tsx
import React, { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { instance } = useMsal();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Make sure we're in the browser
    if (typeof window === "undefined") return;

    // Call MSAL's initialize
    instance.initialize()
      .then(() => {
        console.log("MSAL initialized successfully.");
        setInitialized(true);
      })
      .catch((err) => {
        console.error("Error initializing MSAL:", err);
      });
  }, [instance]);

  if (!initialized) {
    return <div>Initializing authentication...</div>;
  }

  // Once initialized, MSAL is safe to use
  return <>{children}</>;
};

export default AuthWrapper;
