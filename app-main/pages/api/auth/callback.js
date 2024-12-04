// pages/api/auth/callback.js
import { getToken } from '../../../lib/authHelper';
import { serialize } from 'cookie';

export default async function handler(req, res) {
  const code = req.query.code;

  try {
    const tokenResponse = await getToken(code);

    // Store tokens in cookies
    res.setHeader('Set-Cookie', [
      serialize('accessToken', tokenResponse.accessToken, {
        path: '/',
        httpOnly: true,
      }),
      serialize('idToken', tokenResponse.idToken, {
        path: '/',
        httpOnly: true,
      }),
    ]);

    // Redirect to private page
    res.redirect('/private');
  } catch (error) {
    console.error('Error in callback:', error);
    res.status(500).json({ error: 'Token Acquisition Error' });
  }
}
