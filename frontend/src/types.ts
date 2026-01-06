export type ProcurementStatus = "open" | "inprogress" | "closed";

export type OrderLine = {
  product: string;
  unitPrice: number;
  quantity: number;
  totalCost: number;
};

export type OfferExtraction = {
  requestor: string | null;
  vendor: string;
  commodityGroup: string;
  description: string;
  vatId: string;
  orderLines: OrderLine[];
  totalCost: number;
};

export type ProcurementRequest = {
  id: string;
  uploadId: string;
  status: ProcurementStatus;
  extraction: OfferExtraction;
  createdAt: string;
  updatedAt: string;
};

export type UploadSummary = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  procurementRequest?: ProcurementRequest;
};

export type UploadResponse = {
  id: string;
  message: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  procurementRequest: ProcurementRequest;
};
