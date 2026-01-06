import { type Binary, type ObjectId } from "mongodb";

export type StoredUpload = {
  _id?: ObjectId;
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: Buffer | Binary | Uint8Array;
  uploadedAt: Date;
};

export type UploadSummary = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
};

export type UploadContent = {
  fileName: string;
  mimeType: string;
  data: Buffer;
};
