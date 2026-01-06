import { type Collection } from "mongodb";
import { getDatabase } from "./client.js";
import { type StoredUpload } from "../domain/models/upload.js";

const COLLECTION_NAME = "uploads";

export async function getUploadsCollection(): Promise<Collection<StoredUpload>> {
  const db = await getDatabase();
  return db.collection<StoredUpload>(COLLECTION_NAME);
}
