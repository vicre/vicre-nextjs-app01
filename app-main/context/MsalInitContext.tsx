// context/MsalInitContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";

interface MsalInitContextValue {
  initialized: boolean;
}

const MsalInitContext = createContext<MsalInitContextValue>({
  initialized: false,
});

export const MsalInitProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { instance } = useMsal();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    instance
      .initialize()
      .then(() => {
        console.log("MSAL initialized successfully.");
        setInitialized(true);
      })
      .catch((err) => {
        console.error("Error initializing MSAL:", err);
      });
  }, [instance]);

  return (
    <MsalInitContext.Provider value={{ initialized }}>
      {children}
    </MsalInitContext.Provider>
  );
};

export function useMsalInitialization() {
  return useContext(MsalInitContext);
}
