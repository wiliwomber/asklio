import { z } from "zod";

export enum CommodityGroupEnum {
  // General Services
  ACCOMMODATION_RENTALS = "Accommodation Rentals",
  MEMBERSHIP_FEES = "Membership Fees",
  WORKPLACE_SAFETY = "Workplace Safety",
  CONSULTING = "Consulting",
  FINANCIAL_SERVICES = "Financial Services",
  FLEET_MANAGEMENT = "Fleet Management",
  RECRUITMENT_SERVICES = "Recruitment Services",
  PROFESSIONAL_DEVELOPMENT = "Professional Development",
  MISCELLANEOUS_SERVICES = "Miscellaneous Services",
  INSURANCE = "Insurance",

  // Facility Management
  ELECTRICAL_ENGINEERING = "Electrical Engineering",
  FACILITY_MANAGEMENT_SERVICES = "Facility Management Services",
  SECURITY = "Security",
  RENOVATIONS = "Renovations",
  OFFICE_EQUIPMENT = "Office Equipment",
  ENERGY_MANAGEMENT = "Energy Management",
  MAINTENANCE = "Maintenance",
  CAFETERIA_AND_KITCHENETTES = "Cafeteria and Kitchenettes",
  CLEANING = "Cleaning",

  // Publishing Production
  AUDIO_VISUAL_PRODUCTION = "Audio and Visual Production",
  BOOKS_VIDEOS_CDS = "Books/Videos/CDs",
  PRINTING_COSTS = "Printing Costs",
  SOFTWARE_DEVELOPMENT_PUBLISHING = "Software Development for Publishing",
  MATERIAL_COSTS = "Material Costs",
  SHIPPING_PRODUCTION = "Shipping for Production",
  DIGITAL_PRODUCT_DEVELOPMENT = "Digital Product Development",
  PRE_PRODUCTION = "Pre-production",
  POST_PRODUCTION_COSTS = "Post-production Costs",

  // Information Technology
  HARDWARE = "Hardware",
  IT_SERVICES = "IT Services",
  SOFTWARE = "Software",

  // Logistics
  COURIER_EXPRESS_POSTAL = "Courier, Express, and Postal Services",
  WAREHOUSING_MATERIAL_HANDLING = "Warehousing and Material Handling",
  TRANSPORTATION_LOGISTICS = "Transportation Logistics",
  DELIVERY_SERVICES = "Delivery Services",

  // Marketing & Advertising
  ADVERTISING = "Advertising",
  OUTDOOR_ADVERTISING = "Outdoor Advertising",
  MARKETING_AGENCIES = "Marketing Agencies",
  DIRECT_MAIL = "Direct Mail",
  CUSTOMER_COMMUNICATION = "Customer Communication",
  ONLINE_MARKETING = "Online Marketing",
  EVENTS = "Events",
  PROMOTIONAL_MATERIALS = "Promotional Materials",

  // Production
  WAREHOUSE_OPERATIONAL_EQUIPMENT = "Warehouse and Operational Equipment",
  PRODUCTION_MACHINERY = "Production Machinery",
  SPARE_PARTS = "Spare Parts",
  INTERNAL_TRANSPORTATION = "Internal Transportation",
  PRODUCTION_MATERIALS = "Production Materials",
  CONSUMABLES = "Consumables",
  MAINTENANCE_REPAIRS = "Maintenance and Repairs",
}

export enum CategoryEnum {
  GENERAL_SERVICES = "General Services",
  FACILITY_MANAGEMENT = "Facility Management",
  PUBLISHING_PRODUCTION = "Publishing Production",
  INFORMATION_TECHNOLOGY = "Information Technology",
  LOGISTICS = "Logistics",
  MARKETING_ADVERTISING = "Marketing & Advertising",
  PRODUCTION = "Production",
}

// Zod schemas
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

export const CommodityCategorySchema = z.object({
  id: z.number().int().positive(),
  category: z.nativeEnum(CategoryEnum),
  commodityGroup: z.nativeEnum(CommodityGroupEnum),
});

// TypeScript types inferred from Zod schemas
export type OrderLine = z.infer<typeof OrderLineSchema>;
export type OfferExtraction = z.infer<typeof OfferExtractionSchema>;
export type CommodityCategory = z.infer<typeof CommodityCategorySchema>;

export const COMMODITY_CATEGORIES: readonly CommodityCategory[] = [
  { id: 1, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.ACCOMMODATION_RENTALS },
  { id: 2, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.MEMBERSHIP_FEES },
  { id: 3, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.WORKPLACE_SAFETY },
  { id: 4, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.CONSULTING },
  { id: 5, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.FINANCIAL_SERVICES },
  { id: 6, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.FLEET_MANAGEMENT },
  { id: 7, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.RECRUITMENT_SERVICES },
  { id: 8, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.PROFESSIONAL_DEVELOPMENT },
  { id: 9, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.MISCELLANEOUS_SERVICES },
  { id: 10, category: CategoryEnum.GENERAL_SERVICES, commodityGroup: CommodityGroupEnum.INSURANCE },

  { id: 11, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.ELECTRICAL_ENGINEERING },
  { id: 12, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.FACILITY_MANAGEMENT_SERVICES },
  { id: 13, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.SECURITY },
  { id: 14, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.RENOVATIONS },
  { id: 15, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.OFFICE_EQUIPMENT },
  { id: 16, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.ENERGY_MANAGEMENT },
  { id: 17, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.MAINTENANCE },
  { id: 18, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.CAFETERIA_AND_KITCHENETTES },
  { id: 19, category: CategoryEnum.FACILITY_MANAGEMENT, commodityGroup: CommodityGroupEnum.CLEANING },

  { id: 20, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.AUDIO_VISUAL_PRODUCTION },
  { id: 21, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.BOOKS_VIDEOS_CDS },
  { id: 22, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.PRINTING_COSTS },
  { id: 23, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.SOFTWARE_DEVELOPMENT_PUBLISHING },
  { id: 24, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.MATERIAL_COSTS },
  { id: 25, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.SHIPPING_PRODUCTION },
  { id: 26, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.DIGITAL_PRODUCT_DEVELOPMENT },
  { id: 27, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.PRE_PRODUCTION },
  { id: 28, category: CategoryEnum.PUBLISHING_PRODUCTION, commodityGroup: CommodityGroupEnum.POST_PRODUCTION_COSTS },

  { id: 29, category: CategoryEnum.INFORMATION_TECHNOLOGY, commodityGroup: CommodityGroupEnum.HARDWARE },
  { id: 30, category: CategoryEnum.INFORMATION_TECHNOLOGY, commodityGroup: CommodityGroupEnum.IT_SERVICES },
  { id: 31, category: CategoryEnum.INFORMATION_TECHNOLOGY, commodityGroup: CommodityGroupEnum.SOFTWARE },

  { id: 32, category: CategoryEnum.LOGISTICS, commodityGroup: CommodityGroupEnum.COURIER_EXPRESS_POSTAL },
  { id: 33, category: CategoryEnum.LOGISTICS, commodityGroup: CommodityGroupEnum.WAREHOUSING_MATERIAL_HANDLING },
  { id: 34, category: CategoryEnum.LOGISTICS, commodityGroup: CommodityGroupEnum.TRANSPORTATION_LOGISTICS },
  { id: 35, category: CategoryEnum.LOGISTICS, commodityGroup: CommodityGroupEnum.DELIVERY_SERVICES },

  { id: 36, category: CategoryEnum.MARKETING_ADVERTISING, commodityGroup: CommodityGroupEnum.ADVERTISING },
  { id: 37, category: CategoryEnum.MARKETING_ADVERTISING, commodityGroup: CommodityGroupEnum.OUTDOOR_ADVERTISING },
  { id: 38, category: CategoryEnum.MARKETING_ADVERTISING, commodityGroup: CommodityGroupEnum.MARKETING_AGENCIES },
  { id: 39, category: CategoryEnum.MARKETING_ADVERTISING, commodityGroup: CommodityGroupEnum.DIRECT_MAIL },
  { id: 40, category: CategoryEnum.MARKETING_ADVERTISING, commodityGroup: CommodityGroupEnum.CUSTOMER_COMMUNICATION },
  { id: 41, category: CategoryEnum.MARKETING_ADVERTISING, commodityGroup: CommodityGroupEnum.ONLINE_MARKETING },
  { id: 42, category: CategoryEnum.MARKETING_ADVERTISING, commodityGroup: CommodityGroupEnum.EVENTS },
  { id: 43, category: CategoryEnum.MARKETING_ADVERTISING, commodityGroup: CommodityGroupEnum.PROMOTIONAL_MATERIALS },

  { id: 44, category: CategoryEnum.PRODUCTION, commodityGroup: CommodityGroupEnum.WAREHOUSE_OPERATIONAL_EQUIPMENT },
  { id: 45, category: CategoryEnum.PRODUCTION, commodityGroup: CommodityGroupEnum.PRODUCTION_MACHINERY },
  { id: 46, category: CategoryEnum.PRODUCTION, commodityGroup: CommodityGroupEnum.SPARE_PARTS },
  { id: 47, category: CategoryEnum.PRODUCTION, commodityGroup: CommodityGroupEnum.INTERNAL_TRANSPORTATION },
  { id: 48, category: CategoryEnum.PRODUCTION, commodityGroup: CommodityGroupEnum.PRODUCTION_MATERIALS },
  { id: 49, category: CategoryEnum.PRODUCTION, commodityGroup: CommodityGroupEnum.CONSUMABLES },
  { id: 50, category: CategoryEnum.PRODUCTION, commodityGroup: CommodityGroupEnum.MAINTENANCE_REPAIRS },
];
