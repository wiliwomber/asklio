import { type Binary, type ObjectId } from "mongodb";

export type StoredUpload = {
  _id?: ObjectId;
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: Buffer | Binary | Uint8Array;
  uploadedAt: Date;
};
