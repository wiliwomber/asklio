import { z } from "zod";
import { CommodityGroupEnum } from "./commodity.js";

export const OrderLineSchema = z.object({
  product: z.string().nullable(),
  unitPrice: z.number().positive().nullable(),
  quantity: z.number().positive().int().nullable(),
  totalCost: z.number().positive().nullable(),
})

export const OfferExtractionSchema = z.object({
  requestor: z.string().nullable(),
  vendor: z.string().nullable(),
  commodityGroup: z.nativeEnum(CommodityGroupEnum).nullable(),
  description: z.string().nullable(),
  vatId: z.string().nullable(),
  orderLines: z.array(OrderLineSchema).nullable(),
  totalCost: z.number().positive().nullable(),
});

export type OrderLine = z.infer<typeof OrderLineSchema>;
export type OfferExtraction = z.infer<typeof OfferExtractionSchema>;
