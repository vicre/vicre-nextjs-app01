// components/LoginPage.tsx
import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/router";
import { useMsalInitialization } from "../context/MsalInitContext";

const LoginPage: React.FC = () => {
  const { instance } = useMsal();
  const router = useRouter();
  const { initialized } = useMsalInitialization();

  useEffect(() => {
    if (!initialized) return; // Wait for MSAL init
    if (typeof window === "undefined") return; // Only run in the browser

    const returnUrl = (router.query.returnUrl as string) || "/";
    console.log("LoginPage loaded. Return URL:", returnUrl);

    instance
      .handleRedirectPromise()
      .then((response) => {
        if (response?.account) {
          // If returning from AAD with an account
          instance.setActiveAccount(response.account);
          document.cookie = `msalUser=${response.account.username}; path=/;`;
          router.push(returnUrl);
        } else {
          // Check if there's already an account in the cache
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            instance.setActiveAccount(accounts[0]);
            document.cookie = `msalUser=${accounts[0].username}; path=/;`;
            router.push(returnUrl);
          } else {
            // No account at all - initiate login
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
