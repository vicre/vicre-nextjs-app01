// pages/api/auth/login.js
import { getAuthUrl } from '../../../lib/authHelper';

export default async function handler(req, res) {
  try {
    const authUrl = await getAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ error: 'Authentication Error' });
  }
}
