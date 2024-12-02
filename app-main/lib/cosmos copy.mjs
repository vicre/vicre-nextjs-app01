// lib/cosmos.js

import { CosmosClient } from "@azure/cosmos";
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // Ensure environment variables are loaded

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = "AppData";
const containerId = "OUToEmailMap";

const client = new CosmosClient({ endpoint, key });

async function initCosmos() {
  // Create the database if it does not exist
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  console.log(`Database "${database.id}" is ready.`);

  // Create the container if it does not exist
  const { container } = await database.containers.createIfNotExists({ id: containerId });
  console.log(`Container "${container.id}" is ready.`);

  return container;
}

const containerPromise = initCosmos();

export { client, containerPromise };
