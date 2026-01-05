import { MongoClient, type Collection, type ObjectId } from "mongodb";

const DATABASE_NAME = process.env.MONGODB_DB ?? "asklio";
const COLLECTION_NAME = "uploads";

export type UploadDocument = {
  _id?: ObjectId;
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: Buffer;
  uploadedAt: Date;
};

let client: MongoClient | null = null;

async function getClient(): Promise<MongoClient> {
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

export async function getUploadsCollection(): Promise<Collection<UploadDocument>> {
  const activeClient = await getClient();
  const database = activeClient.db(DATABASE_NAME);
  return database.collection<UploadDocument>(COLLECTION_NAME);
}
