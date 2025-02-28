// pages/api/msal/ouToEmailMap.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getOuToEmailMap } from '../../../services/api/ouToEmailMap'; 
// import { parseCookies } from 'nookies';  // or whichever auth mechanism you have

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. (Optionally) Check if the user is authenticated on the server side.
  //    For example, using cookies, tokens, or session data:
  // const cookies = parseCookies({ req });
  // if (!cookies.msalUser) {
  //   return res.status(401).json({ error: 'Not authenticated' });
  // }

  if (req.method === 'GET') {
    try {
      const ouToEmailMap = await getOuToEmailMap(); 
      return res.status(200).json({ ouToEmailMap });
    } catch (error) {
      console.error('Error retrieving data:', error);
      return res.status(500).json({ error: 'Failed to retrieve data' });
    }
  }

  // If it’s a POST or other method, you can either handle or return 405
  return res.status(405).json({ error: 'Method Not Allowed' });
}
