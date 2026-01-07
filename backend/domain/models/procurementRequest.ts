import { type Binary, type ObjectId } from "mongodb";
import { z } from "zod";
import { OrderLineSchema, type OfferExtraction } from "./offerSchemas.js";

export const ProcurementStatusSchema = z.enum(["open", "inprogress", "closed"]);
export type ProcurementStatus = z.infer<typeof ProcurementStatusSchema>;

export type DocumentPayload = {
  fileName: string;
  fileSize: number;
  mimeType: string;
  data: Buffer | Binary | Uint8Array;
  uploadedAt: Date;
};

export type ProcurementRequest = {
  _id?: ObjectId;
  status: ProcurementStatus;
  document: DocumentPayload;
  // Flattened extraction data
  requestor?: string | null;
  vendor?: string | null;
  commodityGroup?: string | null;
  category?: string | null;
  description?: string | null;
  vatId?: string | null;
  orderLines: Array<z.infer<typeof OrderLineSchema>>;
  totalCost?: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ProcurementRequestResponse = Omit<ProcurementRequest, "document" | "_id"> & {
  id: string;
  document: Omit<DocumentPayload, "data" | "uploadedAt"> & { uploadedAt: string };
  createdAt: string;
  updatedAt: string;
};
