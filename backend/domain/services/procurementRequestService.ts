import { ObjectId } from "mongodb";
import { getProcurementRequestsCollection } from "../../db/procurementRequestsCollection.js";
import { type ProcurementRequest, type ProcurementStatus } from "../models/procurementRequest.js";
import { type OfferExtraction } from "../models/offerSchemas.js";
import { logError } from "../../utils/logger.js";

export async function createProcurementRequest(params: {
  uploadId: ObjectId;
  extraction: OfferExtraction;
  status?: ProcurementStatus;
}): Promise<ProcurementRequest> {
  try {
    const collection = await getProcurementRequestsCollection();
    const now = new Date();

    const document: ProcurementRequest = {
      uploadId: params.uploadId,
      status: params.status ?? "open",
      extraction: params.extraction,
      createdAt: now,
      updatedAt: now,
    };

    const { insertedId } = await collection.insertOne(document);
    return { ...document, _id: insertedId };
  } catch (error) {
    logError("Failed to create procurement request", error, { uploadId: params.uploadId.toString() });
    throw error;
  }
}

export async function getProcurementRequestByUploadId(uploadId: ObjectId): Promise<ProcurementRequest | null> {
  try {
    const collection = await getProcurementRequestsCollection();
    return await collection.findOne({ uploadId });
  } catch (error) {
    logError("Failed to fetch procurement request by upload id", error, { uploadId: uploadId.toString() });
    throw error;
  }
}
