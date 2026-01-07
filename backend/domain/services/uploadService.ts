import { Binary, ObjectId } from "mongodb";
import { getUploadsCollection } from "../../db/uploadsCollection.js";
import { type StoredUpload } from "../models/upload.js";
import { type ProcurementRequest } from "../models/procurementRequest.js";
import { getProcurementRequestByUploadId } from "./procurementRequestService.js";
import { logError } from "../../utils/logger.js";

function toBuffer(data: StoredUpload["data"]): Buffer | null {
  if (data instanceof Buffer) {
    return data;
  }

  if (data instanceof Binary) {
    return data.buffer;
  }

  if (data instanceof Uint8Array) {
    return Buffer.from(data);
  }

  if (data && typeof (data as { buffer?: unknown }).buffer === "object") {
    return Buffer.from((data as { buffer: ArrayBuffer }).buffer);
  }

  return null;
}

export type UploadWithRequest = ProcurementRequest & {
  id: string;
  uploadMeta: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
};

export async function storeUpload(params: { fileName: string; mimeType: string; fileSize: number; data: Buffer }) {
  try {
    const uploads = await getUploadsCollection();

    const document: StoredUpload = {
      fileName: params.fileName,
      fileSize: params.fileSize,
      mimeType: params.mimeType,
      data: params.data,
      uploadedAt: new Date(),
    };

    const { insertedId } = await uploads.insertOne(document);

    return {
      insertedId,
      uploadMeta: {
        fileName: document.fileName,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt.toISOString(),
      },
    };
  } catch (error) {
    logError("Failed to store upload", error, { fileName: params.fileName });
    throw error;
  }
}

export async function listUploadsWithRequests(): Promise<UploadWithRequest[]> {
  try {
    const uploads = await getUploadsCollection();
    const documents = await uploads.find({}, { projection: { data: 0 } }).sort({ uploadedAt: -1 }).toArray();

    const results: UploadWithRequest[] = [];

    for (const document of documents) {
      const request = await getProcurementRequestByUploadId(document._id!);

      if (request) {
        results.push({
          ...request,
          id: request._id?.toString() ?? "",
          uploadMeta: {
            fileName: document.fileName,
            fileSize: document.fileSize,
            uploadedAt: document.uploadedAt.toISOString(),
          },
        });
      }
    }

    return results;
  } catch (error) {
    logError("Failed to list uploads with procurement requests", error);
    throw error;
  }
}

export async function getUploadContent(id: string) {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid upload id");
  }

  try {
    const uploads = await getUploadsCollection();
    const document = await uploads.findOne({ _id: new ObjectId(id) });

    if (!document) {
      return null;
    }

    const buffer = toBuffer(document.data);
    if (!buffer) {
      throw new Error("Stored file is not readable");
    }

    return {
      fileName: document.fileName,
      mimeType: document.mimeType || "application/pdf",
      data: buffer,
    };
  } catch (error) {
    logError("Failed to fetch upload content", error, { uploadId: id });
    throw error;
  }
}
