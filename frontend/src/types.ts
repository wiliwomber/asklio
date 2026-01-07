export type ProcurementStatus = "open" | "inprogress" | "closed";

export type OrderLine = {
  product?: string | null;
  unitPrice?: number | null;
  quantity?: number | null;
  totalCost?: number | null;
};

export type OfferExtraction = {
  requestor?: string | null;
  vendor?: string | null;
  commodityGroup?: string | null;
  description?: string | null;
  vatId?: string | null;
  orderLines: OrderLine[];
  totalCost?: number | null;
};

export type ProcurementRequest = {
  id: string;
  uploadId: string;
  status: ProcurementStatus;
  extraction: OfferExtraction;
  createdAt: string;
  updatedAt: string;
  uploadMeta: {
    fileName: string;
    fileSize: number;
    uploadedAt: string;
  };
};

export type UploadResponse = {
  id: string;
  message: string;
  uploadMeta: ProcurementRequest["uploadMeta"];
  procurementRequest: ProcurementRequest;
};

export type UploadSummary = ProcurementRequest;
