import { z } from "zod";
import { CommodityGroupEnum } from "./commodity.js";

export const OrderLineSchema = z.object({
  product: z.string().nullable().optional(),
  unitPrice: z.number().positive().nullable().optional(),
  quantity: z.number().positive().int().nullable().optional(),
  totalCost: z.number().positive().nullable().optional(),
});

export const OfferExtractionSchema = z.object({
  requestor: z.string().nullable().optional(),
  vendor: z.string().nullable().optional(),
  commodityGroup: z.nativeEnum(CommodityGroupEnum).nullable().optional(),
  category: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  vatId: z.string().nullable().optional(),
  orderLines: z.array(OrderLineSchema).nullable().optional().transform((value) => value ?? []),
  totalCost: z.number().positive().nullable().optional(),
});

export type OrderLine = z.infer<typeof OrderLineSchema>;
export type OfferExtraction = z.infer<typeof OfferExtractionSchema>;
