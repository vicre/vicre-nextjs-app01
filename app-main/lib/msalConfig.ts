// lib/msalConfig.ts
import { PublicClientApplication, Configuration } from "@azure/msal-browser";

console.log("MSAL Environment Variables:");
console.log("Client ID:", process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID);
console.log("Tenant ID:", process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID);
console.log("Redirect URI:", process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI);

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || "/",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
