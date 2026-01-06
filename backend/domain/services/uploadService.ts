import { Binary, ObjectId } from "mongodb";
import { getUploadsCollection } from "../../db/uploadsCollection.js";
import { type StoredUpload, type UploadContent, type UploadSummary } from "../models/upload.js";

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

function mapToSummary(document: StoredUpload): UploadSummary {
  return {
    id: document._id?.toString() ?? "",
    fileName: document.fileName,
    fileSize: document.fileSize,
    uploadedAt: document.uploadedAt.toISOString(),
  };
}

export async function storeUpload(params: { fileName: string; mimeType: string; fileSize: number; data: Buffer }) {
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
    id: insertedId.toString(),
    summary: mapToSummary({ ...document, _id: insertedId }),
  };
}

export async function listUploads(): Promise<UploadSummary[]> {
  const uploads = await getUploadsCollection();
  const documents = await uploads
    .find({}, { projection: { data: 0 } })
    .sort({ uploadedAt: -1 })
    .toArray();

  return documents.map(mapToSummary);
}

export async function getUploadContent(id: string): Promise<UploadContent | null> {
  if (!ObjectId.isValid(id)) {
    throw new Error("Invalid upload id");
  }

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
}
