// pages/api/ou-to-email-map.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import { removeUnderscoreFields } from '../../lib/utils.mjs'

/**
 * A Next.js API route that:
 *  - POST: bulk-inserts data into `ou_to_email_map`
 *  - GET: selects all from `ou_to_email_map` and sanitizes the results.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Expect an array of objects in the request body
      const ouToEmailMap = req.body

      // Insert or upsert all items at once.
      // If you need "upsert" behavior, you can use .upsert() with onConflict.
      // E.g.: .upsert(ouToEmailMap, { onConflict: 'id' })
      const { error } = await supabaseAdmin
        .from('ou_to_email_map')
        .insert(ouToEmailMap)

      if (error) {
        console.error('Error inserting data:', error)
        return res.status(500).json({ error: 'Failed to insert data' })
      }

      return res.status(200).json({ message: 'Data inserted successfully' })
    } catch (error) {
      console.error('Error inserting data:', error)
      return res.status(500).json({ error: 'Failed to insert data' })
    }
  } 
  else if (req.method === 'GET') {
    try {
      // Fetch all rows from the `ou_to_email_map` table
      const { data, error } = await supabaseAdmin
        .from('ou_to_email_map')
        .select('*')

      if (error) {
        console.error('Error retrieving data:', error)
        return res.status(500).json({ error: 'Failed to retrieve data' })
      }

      // Optionally remove fields (like `id`) and underscore-prefixed fields.
      // Adjust `removeUnderscoreFields` to your needs.
      const sanitizedResources = removeUnderscoreFields(data ?? [], ['id'])

      return res.status(200).json({ ouToEmailMap: sanitizedResources })
    } catch (error) {
      console.error('Error retrieving data:', error)
      return res.status(500).json({ error: 'Failed to retrieve data' })
    }
  } 
  else {
    // Any other HTTP method is not allowed
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
}
