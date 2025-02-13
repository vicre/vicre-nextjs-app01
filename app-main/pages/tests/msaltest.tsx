// pages/msaltest.tsx
import React, { useEffect } from "react";
import { PublicClientApplication } from "@azure/msal-browser";

const config = {
  auth: {
    clientId: "a6a95256-a693-49c8-b70d-26d2e89d17f0",
    authority: "https://login.microsoftonline.com/f251f123-c9ce-448e-9277-34bb285911d9",
    redirectUri: "https://vicre-nextjs-app01.ngrok.app/msaltest",
  },
};

export default function MsalTestPage() {
  useEffect(() => {
    const instance = new PublicClientApplication(config);

    async function doRedirect() {
      // 1) Must call initialize() first
      await instance.initialize();

      // 2) Then you can call loginRedirect() or other MSAL methods
      instance.loginRedirect({
        scopes: ["User.Read"],
        redirectUri: config.auth.redirectUri,
      });
    }

    doRedirect().catch((error) => {
      console.error("MSAL initialization or loginRedirect failed:", error);
    });
  }, []);

  return <p>Testing MSAL redirect...</p>;
}

