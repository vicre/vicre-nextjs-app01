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
    // Outer container: centers content & lets body background image show
    <div className="flex items-center justify-center min-h-screen p-6">

      {/* Inner "cube": smaller box with rounded corners, white background, black border */}
      <div className="bg-[#ffffff] text-[#000000] border-2 border-[#808080] rounded-xl shadow-lg p-8 max-w-md w-full flex flex-col items-center">
        
        {/* Heading */}
        <h1 className="text-4xl neo-sans-bold text-center mb-6 text-[#990000]">
          Microsoft Login Required
        </h1>

        {/* Body text */}
        <p className="neo-sans-regular mb-6 max-w-md text-center">
          This app requires you to log in with your Microsoft account.
        </p>
        <p className="neo-sans-bold mb-6 max-w-md text-center">
          <br />
          Click the button below to proceed.
        </p>

        {/* Login button */}
        <button
          onClick={handleLogin}
          className="
            neo-sans-bold
            px-6 py-3
            bg-[#990000] hover:bg-red-800
            text-white text-lg
            rounded-md
            border-2 border-[#000000]
            shadow-md
            transition-colors duration-300
          "
        >
          Login with Microsoft
        </button>
      </div>
    </div>
  );
  // return (
  //   <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
  //     <h1 className="text-3xl font-bold mb-6">Microsoft Login required</h1>
  //     <body className="text-lg mb-6">
  //       This app requires you to login with your Microsoft account. <br />
  //       Click the button below to login.
  //     </body>
  //     <button
  //       onClick={handleLogin}
  //       className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white text-lg rounded-lg shadow-md"
  //     >
  //       Login with Microsoft
  //     </button>
  //   </div>
  // );
};
export default LoginPage;