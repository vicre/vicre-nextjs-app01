import React, { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useRouter } from "next/router";

const LoginPage: React.FC = () => {
  const { instance } = useMsal();
  const router = useRouter();

  useEffect(() => {
    const returnUrl = router.query.returnUrl as string || "/";
    instance.handleRedirectPromise().then((response) => {
      if (response && response.account) {
        instance.setActiveAccount(response.account); // Set the active account
        router.push(returnUrl); // Redirect to the original URL or fallback to the home page
      }
    });
  }, [instance, router]);

  const handleLogin = () => {
    const returnUrl = router.query.returnUrl as string || "/";
    instance.loginRedirect({
      scopes: ["User.Read"], // Add necessary scopes
      redirectUri: process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI,
      state: encodeURIComponent(returnUrl), // Pass return URL as state
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <button
        onClick={handleLogin}
        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg rounded-lg shadow-md"
      >
        Login with Microsoft
      </button>
    </div>
  );
};

export default LoginPage;
