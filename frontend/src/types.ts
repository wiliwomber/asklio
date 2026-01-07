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
  status: ProcurementStatus;
  requestor?: string | null;
  vendor?: string | null;
  commodityGroup?: string | null;
  description?: string | null;
  vatId?: string | null;
  orderLines: OrderLine[];
  totalCost?: number | null;
  createdAt: string;
  updatedAt: string;
  document: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
};

export type UploadResponse = {
  id: string;
  message: string;
  procurementRequest: ProcurementRequest;
};

export type UploadSummary = ProcurementRequest;
  procurementRequest: ProcurementRequest;
};

export type UploadSummary = ProcurementRequest;
