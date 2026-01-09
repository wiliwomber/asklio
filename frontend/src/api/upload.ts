import { type UploadResponse, type UploadSummary } from "../types";

const DEFAULT_API_BASE_URL = "http://localhost:3000";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL;

export async function uploadPdf(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await fetch(`${API_BASE_URL}/api/uploads`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || "Failed to upload PDF");
  }

  return response.json();
}

export async function fetchUploads(): Promise<UploadSummary[]> {
  const response = await fetch(`${API_BASE_URL}/api/uploads`);

  if (!response.ok) {
    throw new Error("Failed to fetch uploads");
  }

  return response.json();
}

export function buildPdfUrl(id: string): string {
  return `${API_BASE_URL}/api/uploads/${id}`;
}

export async function updateProcurementRequest(id: string, payload: Partial<UploadSummary>): Promise<UploadSummary> {
  const response = await fetch(`${API_BASE_URL}/api/requests/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("Failed to update procurement request");
  }

  return response.json();
}
