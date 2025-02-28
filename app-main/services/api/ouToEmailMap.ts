// services/api/ouToEmailMap.ts

import { supabaseAdmin } from '../../lib/api/supabaseAdmin';

// Retrieve rows from `ou_to_email_map`
export async function getOuToEmailMap(columns?: string[]) {
  // By default, select everything (star)
  let selectColumns = '*';

  // If an array of columns is provided, join them into a string
  if (Array.isArray(columns) && columns.length > 0) {
    selectColumns = columns.join(',');
  }

  const { data, error } = await supabaseAdmin
    .from('ou_to_email_map')
    .select(selectColumns);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
