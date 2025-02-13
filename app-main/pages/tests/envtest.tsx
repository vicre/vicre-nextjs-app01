// pages/envtest.tsx
import React, { useEffect } from "react";

export default function EnvTestPage() {
  useEffect(() => {
    console.log("MSAL Environment Variables (from client-side):");
    console.log("Client ID:", process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID);
    console.log("Tenant ID:", process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID);
    console.log("Redirect URI:", process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI);
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Environment Variables Test</h1>
      <p>
        <strong>Client ID:</strong>{" "}
        {process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "undefined"}
      </p>
      <p>
        <strong>Tenant ID:</strong>{" "}
        {process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || "undefined"}
      </p>
      <p>
        <strong>Redirect URI:</strong>{" "}
        {process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || "undefined"}
      </p>
    </div>
  );
}
