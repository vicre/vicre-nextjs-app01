import React, { createContext, useContext, useEffect, useState } from "react";
import { msalInstance } from "../lib/msalConfig";

const MsalInitContext = createContext({ initialized: false });

export const MsalInitProvider = ({ children }: { children: React.ReactNode }) => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function initializeMsal() {
      try {
        await msalInstance.initialize();
        setInitialized(true);
        console.log("MSAL initialized successfully.");
      } catch (error) {
        console.error("Error initializing MSAL:", error);
      }
    }
    initializeMsal();
  }, []);

  return (
    <MsalInitContext.Provider value={{ initialized }}>
      {children}
    </MsalInitContext.Provider>
  );
};

export const useMsalInitialization = () => useContext(MsalInitContext);