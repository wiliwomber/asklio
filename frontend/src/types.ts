export type UploadResponse = {
  message: string;
  fileName: string;
  fileSize: number;
};

export type UploadSummary = {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
};
