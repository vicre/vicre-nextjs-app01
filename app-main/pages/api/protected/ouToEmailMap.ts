// pages/api/ou-to-email-map.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getOuToEmailMap } from '../../../services/api/ouToEmailMap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      /**
       * Expect something like:
       *    GET /api/ou-to-email-map?columns=id,emails
       * or  GET /api/ou-to-email-map?columns=emails
       *
       * Then parse and split into an array of columns.
       * If not provided, we default to all columns (*).
       */
      const { columns } = req.query;

      let columnsArray: string[] | undefined = undefined;
      if (typeof columns === 'string') {
        columnsArray = columns.split(',').map((col) => col.trim());
      }

      const ouToEmailMap = await getOuToEmailMap(columnsArray);
      return res.status(200).json({ ouToEmailMap });
    } catch (error) {
      console.error('Error retrieving data:', error);
      return res.status(500).json({ error: 'Failed to retrieve data' });
    }
  }

  // Any other HTTP method is not allowed
  return res.status(405).json({ error: 'Method Not Allowed' });
}
