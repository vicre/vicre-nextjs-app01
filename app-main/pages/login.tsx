import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/router";
import { useMsalInitialization } from "../context/MsalInitContext";

export default function LoginPage() {
  const { instance } = useMsal();
  const router = useRouter();
  const { initialized } = useMsalInitialization();

  useEffect(() => {
    console.log("=== ENV VARIABLES (from LoginPage) ===");
    console.log("Client ID:", process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID);
    console.log("Tenant ID:", process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID);
    console.log("Redirect URI:", process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI);
  }, []);

  useEffect(() => {
    // Wait until MSAL is initialized
    if (!initialized) {
      console.log("MSAL not initialized yet. Waiting...");
      return;
    }

    // Only run on the client
    if (typeof window === "undefined") return;

    const returnUrl = (router.query.returnUrl as string) || "/";
    console.log("LoginPage loaded. Return URL:", returnUrl);

    // 1) handleRedirectPromise first:
    instance
      .handleRedirectPromise()
      .then((response) => {
        console.log("handleRedirectPromise response:", response);
        if (response?.account) {
          // Coming back from AAD with an account
          console.log("handleRedirectPromise found an account:", response.account);
          instance.setActiveAccount(response.account);
          document.cookie = `msalUser=${response.account.username}; path=/;`;
          router.push(returnUrl);
        } else {
          // Check if we already have an account in the cache
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            console.log("We have cached accounts:", accounts);
            instance.setActiveAccount(accounts[0]);
            document.cookie = `msalUser=${accounts[0].username}; path=/;`;
            router.push(returnUrl);
          } else {
            // 2) No accounts -> redirect to Azure AD
            console.log("No account found. Redirecting to Azure AD login...");
            instance.loginRedirect({
              scopes: ["User.Read"],
              redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI,
              state: encodeURIComponent(returnUrl),
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error during handleRedirectPromise:", error);
      });
  }, [initialized, instance, router]);

  return (
    <div>
      <h1>Redirecting to Microsoft login...</h1>
      <p>
        <strong>Client ID:</strong>{" "}
        {process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID || "N/A"}
      </p>
      <p>
        <strong>Tenant ID:</strong>{" "}
        {process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID || "N/A"}
      </p>
      <p>
        <strong>Redirect URI:</strong>{" "}
        {process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || "N/A"}
      </p>
    </div>
  );
}
