// pages/login.tsx
import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/router";
import { useMsalInitialization } from "../context/MsalInitContext";

const LoginPage: React.FC = () => {
  const { instance } = useMsal();
  const router = useRouter();

  // This hook gives us the "initialized" state from our context
  const { initialized } = useMsalInitialization();

  useEffect(() => {
    // Wait until MSAL is fully initialized
    if (!initialized) return;
    if (typeof window === "undefined") return;

    const returnUrl = (router.query.returnUrl as string) || "/";
    console.log("LoginPage loaded. Return URL:", returnUrl);

    // 1) Handle the case we are returning from a redirect
    instance
      .handleRedirectPromise()
      .then((response) => {
        if (response?.account) {
          // If we're returning from Azure AD with an account
          instance.setActiveAccount(response.account);
          // Set a cookie or do whatever you like
          document.cookie = `msalUser=${response.account.username}; path=/;`;
          router.push(returnUrl);
        } else {
          // 2) If not returning from a redirect, check if we already have an account in cache
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            // We already have a signed-in user
            instance.setActiveAccount(accounts[0]);
            document.cookie = `msalUser=${accounts[0].username}; path=/;`;
            router.push(returnUrl);
          } else {
            // 3) If there is no account at all, initiate a new login redirect
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

  return <div>Redirecting to Microsoft login...</div>;
};

export default LoginPage;