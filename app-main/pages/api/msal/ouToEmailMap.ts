import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '../../../lib/api/supabaseAdmin'; // Admin client
import { removeUnderscoreFields } from '../../../lib/utils'; // Just an example
// import { parseCookies } from 'nookies' // or any cookie/session library if needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Check if the user is authenticated on the server side.
  //    For example, reading your "msalUser" cookie:
  // const cookies = parseCookies({ req });
  // if (!cookies.msalUser) {
  //   return res.status(401).json({ error: 'Not authenticated' });
  // }

  // 2. Perform your database (Supabase) query with the admin client
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabaseAdmin
        .from('ou_to_email_map')
        .select('*');

      if (error) {
        console.error('Error retrieving data:', error);
        return res.status(500).json({ error: 'Failed to retrieve data' });
      }

      // Optionally remove fields you don’t want to expose
      const sanitized = removeUnderscoreFields(data ?? [], ['id']);
      return res.status(200).json({ ouToEmailMap: sanitized });
    } catch (error) {
      console.error('Error retrieving data:', error);
      return res.status(500).json({ error: 'Failed to retrieve data' });
    }
  }

  // If it’s a POST or other method, you can either block or handle similarly
  return res.status(405).json({ error: 'Method Not Allowed' });
}
