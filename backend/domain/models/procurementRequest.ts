import { type ObjectId } from "mongodb";
import { z } from "zod";
import { OfferExtractionSchema, type OfferExtraction } from "./offerSchemas.js";

export const ProcurementStatusSchema = z.enum(["open", "inprogress", "closed"]);
export type ProcurementStatus = z.infer<typeof ProcurementStatusSchema>;

export type ProcurementRequest = {
  _id?: ObjectId;
  uploadId: ObjectId;
  status: ProcurementStatus;
  extraction: OfferExtraction;
  createdAt: Date;
  updatedAt: Date;
};
