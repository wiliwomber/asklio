import { z } from "zod";
import { CommodityGroupEnum } from "./commodity.js";

export const OrderLineSchema = z.object({
  product: z.string(),
  unitPrice: z.number().positive(),
  quantity: z.number().positive().int(),
  totalCost: z.number().positive(),
});

export const OfferExtractionSchema = z.object({
  requestor: z.string().nullable(),
  vendor: z.string(),
  commodityGroup: z.nativeEnum(CommodityGroupEnum),
  description: z.string(),
  vatId: z.string(),
  orderLines: z.array(OrderLineSchema),
  totalCost: z.number().positive(),
});

export type OrderLine = z.infer<typeof OrderLineSchema>;
export type OfferExtraction = z.infer<typeof OfferExtractionSchema>;
