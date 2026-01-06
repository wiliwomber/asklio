import { ObjectId } from "mongodb";
import { getProcurementRequestsCollection } from "../../db/procurementRequestsCollection.js";
import {
  type ProcurementRequest,
  type ProcurementRequestSummary,
  type ProcurementStatus,
} from "../models/procurementRequest.js";
import { type OfferExtraction } from "../models/offerSchemas.js";

function mapToSummary(document: ProcurementRequest): ProcurementRequestSummary {
  return {
    id: document._id?.toString() ?? "",
    uploadId: document.uploadId.toString(),
    status: document.status,
    extraction: document.extraction,
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };
}

export async function createProcurementRequest(params: {
  uploadId: ObjectId;
  extraction: OfferExtraction;
  status?: ProcurementStatus;
}): Promise<ProcurementRequestSummary> {
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
  return mapToSummary({ ...document, _id: insertedId });
}

export async function findProcurementRequestByUploadId(uploadId: ObjectId): Promise<ProcurementRequestSummary | null> {
  const collection = await getProcurementRequestsCollection();
  const document = await collection.findOne({ uploadId });

  return document ? mapToSummary(document) : null;
}
