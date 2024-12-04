// pages/_app.js
import '../styles/globals.css';
import { useEffect } from 'react';
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "../authConfig"; // Adjusted path

const msalInstance = new PublicClientApplication(msalConfig);

async function signIn() {
    try {
        await msalInstance.initialize();
        const response = await msalInstance.loginPopup(loginRequest);
        console.log("Login successful:", response);
        // Handle successful login
    } catch (error) {
        console.error("Login failed:", error);
    }
}

async function checkAccount() {
    try {
        await msalInstance.initialize();
        const currentAccounts = msalInstance.getAllAccounts();
        if (currentAccounts.length === 0) {
            await signIn();
        } else {
            console.log("User is already logged in:", currentAccounts[0]);
            // Handle already logged in user
        }
    } catch (error) {
        console.error("Initialization failed:", error);
    }
}

function MyApp({ Component, pageProps }) {
    useEffect(() => {
        checkAccount();
    }, []);

    return <Component {...pageProps} />;
}

export default MyApp;