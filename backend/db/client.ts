import { MongoClient } from "mongodb";

const DATABASE_NAME = process.env.MONGODB_DB ?? "asklio";

let client: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
  if (client) {
    return client;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  client = new MongoClient(uri);
  await client.connect();
  return client;
}

export async function getDatabase() {
  const mongoClient = await getMongoClient();
  return mongoClient.db(DATABASE_NAME);
}
