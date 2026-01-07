import { ObjectId } from "mongodb";
import { getProcurementRequestsCollection } from "../../db/procurementRequestsCollection.js";
import {
  type ProcurementRequest,
  type ProcurementRequestResponse,
  type ProcurementStatus,
  type DocumentPayload,
} from "../models/procurementRequest.js";
import { type OfferExtraction } from "../models/offerSchemas.js";
import { logError } from "../../utils/logger.js";
import { COMMODITY_CATEGORIES } from "../models/commodity.js";

function resolveCategory(commodityGroup?: string | null): string | null {
  if (!commodityGroup) {
    return null;
  }

  const match = COMMODITY_CATEGORIES.find(
    (item) => item.commodityGroup.toLowerCase() === commodityGroup.toLowerCase(),
  );
  return match ? match.category : null;
}

function mapToResponse(document: ProcurementRequest): ProcurementRequestResponse {
  const { document: uploadedDocument, _id, createdAt, updatedAt, ...rest } = document;
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    id: _id?.toString() ?? "",
    document: {
      fileName: uploadedDocument.fileName,
      fileSize: uploadedDocument.fileSize,
      mimeType: uploadedDocument.mimeType,
      uploadedAt: uploadedDocument.uploadedAt.toISOString(),
    },
  };
}

export async function createProcurementRequest(params: {
  document: DocumentPayload;
  extraction: OfferExtraction;
  status?: ProcurementStatus;
}): Promise<ProcurementRequestResponse> {
  try {
    const collection = await getProcurementRequestsCollection();
    const now = new Date();

    const document: ProcurementRequest = {
      status: params.status ?? "open",
      document: params.document,
      requestor: params.extraction.requestor,
      vendor: params.extraction.vendor,
      commodityGroup: params.extraction.commodityGroup,
      category: params.extraction.category ?? resolveCategory(params.extraction.commodityGroup),
      description: params.extraction.description,
      vatId: params.extraction.vatId,
      orderLines: params.extraction.orderLines ?? [],
      totalCost: params.extraction.totalCost,
      createdAt: now,
      updatedAt: now,
    };

    const { insertedId } = await collection.insertOne(document);
    return mapToResponse({ ...document, _id: insertedId });
  } catch (error) {
    logError("Failed to create procurement request", error, { fileName: params.document.fileName });
    throw error;
  }
}

export async function listProcurementRequests(): Promise<ProcurementRequestResponse[]> {
  try {
    const collection = await getProcurementRequestsCollection();
    const documents = await collection
      .find({}, { projection: { "upload.data": 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    return documents.map(mapToResponse);
  } catch (error) {
    logError("Failed to list procurement requests", error);
    throw error;
  }
}

export async function getProcurementRequestById(id: string): Promise<ProcurementRequest | null> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid procurement request id");
  }

  try {
    const collection = await getProcurementRequestsCollection();
    return await collection.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    logError("Failed to fetch procurement request by id", error, { id });
    throw error;
  }
}

export async function getProcurementUploadContent(id: string) {
  const request = await getProcurementRequestById(id);

  if (!request) {
    return null;
  }

  const { document: uploadedDocument } = request;
  const data =
    uploadedDocument.data instanceof Buffer
      ? uploadedDocument.data
      : uploadedDocument.data && typeof (uploadedDocument.data as { buffer?: unknown }).buffer === "object"
        ? Buffer.from((uploadedDocument.data as { buffer: ArrayBuffer }).buffer)
        : Buffer.from(uploadedDocument.data as Uint8Array);

  return {
    fileName: uploadedDocument.fileName,
    mimeType: uploadedDocument.mimeType,
    data,
  };
}
