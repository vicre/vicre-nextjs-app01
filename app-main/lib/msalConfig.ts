import { PublicClientApplication, Configuration } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: "your-client-id", // Replace with your Application (client) ID from Azure
    authority: "https://login.microsoftonline.com/your-tenant-id", // Replace with your Tenant ID
    redirectUri: "http://localhost:3000", // Adjust based on your app's URL
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: true,
  },
};

export const msalInstance = new PublicClientApplication(msalConfig);
