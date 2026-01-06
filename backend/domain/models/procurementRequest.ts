import { type ObjectId } from "mongodb";
import { z } from "zod";
import { OfferExtractionSchema } from "./offerSchemas.js";

export const ProcurementStatusSchema = z.enum(["open", "inprogress", "closed"]);
export type ProcurementStatus = z.infer<typeof ProcurementStatusSchema>;

export type ProcurementRequest = {
  _id?: ObjectId;
  uploadId: ObjectId;
  status: ProcurementStatus;
  extraction: z.infer<typeof OfferExtractionSchema>;
  createdAt: Date;
  updatedAt: Date;
};

export type ProcurementRequestSummary = {
  id: string;
  uploadId: string;
  status: ProcurementStatus;
  extraction: z.infer<typeof OfferExtractionSchema>;
  createdAt: string;
  updatedAt: string;
};
