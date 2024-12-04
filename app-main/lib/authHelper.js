// lib/authHelper.js
import msalInstance from './msalInstance';

export const getAuthUrl = async () => {
  const authCodeUrlParameters = {
    scopes: ['User.Read'],
    redirectUri: process.env.REDIRECT_URI,
  };

  const authUrl = await msalInstance.getAuthCodeUrl(authCodeUrlParameters);
  return authUrl;
};

export const getToken = async (code) => {
  const tokenRequest = {
    code,
    scopes: ['User.Read'],
    redirectUri: process.env.REDIRECT_URI,
  };

  const tokenResponse = await msalInstance.acquireTokenByCode(tokenRequest);
  return tokenResponse;
};
