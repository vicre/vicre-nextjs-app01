// pages/api/ou-to-email-map.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getOuToEmailMap } from "../../../services/api/ouToEmailMap";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    /**
     * Expect something like:
     *   GET /api/ou-to-email-map?columns=id,emails
     * or GET /api/ou-to-email-map?columns=emails
     * or GET /api/ou-to-email-map?columns=id&columns=emails
     *
     * We'll parse it into an array of columns.
     * If not provided, we leave it undefined (or could provide a default).
     */
    const { columns } = req.query;

    let columnsArray: string[] | undefined;

    if (Array.isArray(columns)) {
      // e.g. columns = ["id", "emails"] or ["id,emails"]
      // Flatten in case user passed multiple values separated by commas
      columnsArray = columns
        .flatMap((col) => col.split(",")) // split each
        .map((col) => col.trim());       // remove extra spaces
    } else if (typeof columns === "string") {
      // e.g. "id,emails"
      columnsArray = columns.split(",").map((col) => col.trim());
    }

    // Now columnsArray might be something like: ["id", "emails"] or undefined
    const ouToEmailMap = await getOuToEmailMap(columnsArray);

    return res.status(200).json({ ouToEmailMap });
  } catch (error) {
    console.error("Error retrieving data:", error);
    return res.status(500).json({ error: "Failed to retrieve data" });
  }
}
