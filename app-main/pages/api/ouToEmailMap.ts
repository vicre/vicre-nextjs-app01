import { NextApiRequest, NextApiResponse } from "next";
import { initCosmos } from "../../lib/cosmos.mjs";
import { removeUnderscoreFields } from "../../lib/utils.mjs";

const databaseId = "AppData";
const containerId = "OUToEmailMap";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const container = await initCosmos(databaseId, containerId);

  if (req.method === "POST") {
    try {
      const ouToEmailMap = req.body; // Get data from the request body

      // Insert each item into Cosmos DB
      for (const item of ouToEmailMap) {
        await container.items.upsert(item);
      }

      res.status(200).json({ message: "Data inserted successfully" });
    } catch (error) {
      console.error("Error inserting data:", error);
      res.status(500).json({ error: "Failed to insert data" });
    }
  } else if (req.method === "GET") {
    try {
      const { resources } = await container.items.readAll().fetchAll();

      // Remove underscore-prefixed fields and exclude 'id' field
      const sanitizedResources = removeUnderscoreFields(resources, ["id"]);

      res.status(200).json({ ouToEmailMap: sanitizedResources });
    } catch (error) {
      console.error("Error retrieving data:", error);
      res.status(500).json({ error: "Failed to retrieve data" });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}
