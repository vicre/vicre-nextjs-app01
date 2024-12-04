// authConfig.js
const msalConfig = {
    auth: {
      clientId: process.env.CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.TENANT_ID}`,
      redirectUri: process.env.REDIRECT_URI,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: true,
    },
  };
  
  const loginRequest = {
    scopes: ['User.Read'],
  };
  
  export { msalConfig, loginRequest };
  