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
import { CommodityGroupEnum } from "../models/commodity.js";

function resolveCategory(commodityGroup?: string | null): string | null {
  if (!commodityGroup) {
    return null;
  }

  const match = COMMODITY_CATEGORIES.find(
    (item) => item.commodityGroup.toLowerCase() === commodityGroup.toLowerCase(),
  );
  return match ? match.category : null;
}

function normalizeCommodityGroup(group?: string | null): CommodityGroupEnum | null {
  if (!group) return null;
  const match = COMMODITY_CATEGORIES.find((item) => item.commodityGroup.toLowerCase() === group.toLowerCase());
  return match ? (match.commodityGroup as CommodityGroupEnum) : null;
}

function validateOpenFields(request: ProcurementRequest) {
  const requiredString = [
    { key: "requestor", value: request.requestor },
    { key: "requestorDepartment", value: request.requestorDepartment },
    { key: "vendor", value: request.vendor },
    { key: "description", value: request.description },
    { key: "vatId", value: request.vatId },
    { key: "commodityGroup", value: request.commodityGroup },
    { key: "category", value: request.category },
  ];

  for (const field of requiredString) {
    if (!field.value) {
      throw new Error(`Missing required field: ${field.key}`);
    }
  }

  if (!request.orderLines || request.orderLines.length === 0) {
    throw new Error("At least one order line is required");
  }

  for (const [index, line] of request.orderLines.entries()) {
    if (!line.product) throw new Error(`Order line ${index + 1}: product is required`);
    if (line.quantity === null || line.quantity === undefined) throw new Error(`Order line ${index + 1}: quantity is required`);
    if (!Number.isFinite(line.quantity)) throw new Error(`Order line ${index + 1}: quantity must be a number`);
    if (line.unitPrice === null || line.unitPrice === undefined) throw new Error(`Order line ${index + 1}: unitPrice is required`);
    if (line.totalCost === null || line.totalCost === undefined) throw new Error(`Order line ${index + 1}: totalCost is required`);
  }

  if (request.totalCost === null || request.totalCost === undefined) {
    throw new Error("totalCost is required");
  }

  const isValidCommodity = COMMODITY_CATEGORIES.some(
    (item) => item.commodityGroup.toLowerCase() === request.commodityGroup?.toLowerCase(),
  );
  if (!isValidCommodity) {
    throw new Error("commodityGroup is not a valid option");
  }
}

function mapToResponse(document: ProcurementRequest): ProcurementRequestResponse {
  const { document: uploadedDocument, _id, createdAt, updatedAt, ...rest } = document;
  const created = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const updated = updatedAt instanceof Date ? updatedAt : new Date(updatedAt);
  const uploadedAtDate = uploadedDocument.uploadedAt instanceof Date ? uploadedDocument.uploadedAt : new Date(uploadedDocument.uploadedAt);
  return {
    ...rest,
    createdAt: created.toISOString(),
    updatedAt: updated.toISOString(),
    id: _id?.toString() ?? "",
    document: {
      fileName: uploadedDocument.fileName,
      fileSize: uploadedDocument.fileSize,
      mimeType: uploadedDocument.mimeType,
      uploadedAt: uploadedAtDate.toISOString(),
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
      status: params.status ?? "pending",
      document: params.document,
      requestor: params.extraction.requestor,
      requestorDepartment: params.extraction.requestorDepartment,
      vendor: params.extraction.vendor,
      commodityGroup: normalizeCommodityGroup(params.extraction.commodityGroup),
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
      .find({}, { projection: { "document.data": 0 } })
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

export async function updateProcurementRequest(
  id: string,
  updates: Partial<
    Pick<
      ProcurementRequest,
      "requestor" | "requestorDepartment" | "vendor" | "commodityGroup" | "category" | "description" | "vatId" | "orderLines" | "totalCost" | "status"
    >
  >,
): Promise<ProcurementRequestResponse | null> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid procurement request id");
  }

  try {
    const collection = await getProcurementRequestsCollection();
    const updateDoc = {
      ...updates,
      commodityGroup: normalizeCommodityGroup(updates.commodityGroup) ?? updates.commodityGroup ?? undefined,
      category: updates.category ?? resolveCategory(updates.commodityGroup),
      updatedAt: new Date(),
    };

    if (updates.status === "open") {
      const existing = await collection.findOne({ _id: new ObjectId(id) });
      if (!existing) return null;
      const merged: ProcurementRequest = {
        ...existing,
        ...updateDoc,
        document: {
          ...existing.document,
          uploadedAt: existing.document.uploadedAt instanceof Date ? existing.document.uploadedAt : new Date(existing.document.uploadedAt),
        },
        createdAt: existing.createdAt instanceof Date ? existing.createdAt : new Date(existing.createdAt),
        updatedAt: new Date(),
      } as ProcurementRequest;
      validateOpenFields(merged);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" },
    );

    if (!result) {
      return null;
    }

    return mapToResponse(result);
  } catch (error) {
    logError("Failed to update procurement request", error, { id });
    throw error;
  }
}
