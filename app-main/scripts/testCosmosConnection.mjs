// scripts/testCosmosConnection.mjs


import { initCosmos } from '../lib/cosmos.mjs';

(async () => {
  try {
    const databaseId = "AppData";
    const containerId = "OUToEmailMap";

    const container = await initCosmos(databaseId, containerId);
    console.log(`Connected to container: ${container.id}`);
  } catch (error) {
    console.error('Failed to connect to Cosmos DB:', error);
  }
})();
