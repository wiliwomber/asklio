import { type Collection } from "mongodb";
import { getDatabase } from "./client.js";
import { type ProcurementRequest } from "../domain/models/procurementRequest.js";

const COLLECTION_NAME = "procurementRequests";

export async function getProcurementRequestsCollection(): Promise<Collection<ProcurementRequest>> {
  const db = await getDatabase();
  return db.collection<ProcurementRequest>(COLLECTION_NAME);
}
