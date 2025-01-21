import { PublicClientApplication, Configuration } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "",
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID}`,
    redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeMsalInstance() {
  try {
    await msalInstance.initialize(); // Ensure the instance is initialized before use
  } catch (error) {
    console.error("MSAL initialization error:", error);
  }
}
