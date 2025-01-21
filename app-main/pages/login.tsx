// pages/login.tsx
import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/router";

const LoginPage: React.FC = () => {
  const { instance } = useMsal();
  const router = useRouter();

  useEffect(() => {
    // Ensure we only run browser-side
    if (typeof window === "undefined") return;

    const returnUrl = (router.query.returnUrl as string) || "/";
    console.log("LoginPage loaded. Return URL:", returnUrl);

    // 1) MSAL handles the redirect response here
    instance
      .handleRedirectPromise()
      .then((response) => {
        console.log("handleRedirectPromise response:", response);
        if (response && response.account) {
          // Successfully returned from Microsoft with an account
          instance.setActiveAccount(response.account);

          // Set a simple cookie indicating user is logged in
          document.cookie = `msalUser=${response.account.username}; path=/;`;

          // Redirect to the intended returnUrl
          router.push(returnUrl);
        } else {
          // Check if user is already signed in (MSAL cache)
          const accounts = instance.getAllAccounts();
          if (accounts.length > 0) {
            // Already logged in
            instance.setActiveAccount(accounts[0]);
            document.cookie = `msalUser=${accounts[0].username}; path=/;`;
            router.push(returnUrl);
          } else {
            // 2) Not signed in, so auto-redirect to Microsoft for login
            console.log("No account found in MSAL instance. Redirecting to Microsoft...");
            instance.loginRedirect({
              scopes: ["User.Read"], // Your required scopes
              redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI,
              state: encodeURIComponent(returnUrl),
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error during handleRedirectPromise:", error);
      });
  }, [instance, router]);

  // Render a simple message while we handle (or initiate) redirects
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h2 className="text-xl">Redirecting to Microsoft login...</h2>
    </div>
  );
};

export default LoginPage;
