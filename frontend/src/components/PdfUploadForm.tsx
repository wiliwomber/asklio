import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { uploadPdf } from "../api/upload";
import { type UploadResponse } from "../types";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

function isPdf(file: File): boolean {
  const hasPdfMimeType = file.type === "application/pdf";
  const hasPdfExtension = file.name.toLowerCase().endsWith(".pdf");

  return hasPdfMimeType && hasPdfExtension;
}

export default function PdfUploadForm() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileLabel = useMemo(() => {
    if (!selectedFile) {
      return "No file chosen";
    }

    const sizeInMb = (selectedFile.size / (1024 * 1024)).toFixed(2);
    return `${selectedFile.name} (${sizeInMb} MB)`;
  }, [selectedFile]);

  const resetStatus = (): void => {
    setResult(null);
    setError(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    resetStatus();

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!isPdf(file)) {
      setSelectedFile(null);
      setError("Please choose a valid PDF file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSelectedFile(null);
      setError("PDF must be 10MB or smaller.");
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Select a PDF before uploading.");
      return;
    }

    setIsUploading(true);
    setResult(null);
    setError(null);

    try {
      const response = await uploadPdf(selectedFile);
      setResult(response);
    } catch (uploadError) {
      const errorMessage = uploadError instanceof Error ? uploadError.message : "Failed to upload PDF";
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="pdfInput">Upload PDF</label>
        <div className="file-input">
          <input
            id="pdfInput"
            name="pdf"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <span className="file-label">{fileLabel}</span>
        </div>
        <p className="help-text">Only PDF files up to 10MB are accepted.</p>
      </div>

      <div className="actions">
        <button type="submit" disabled={!selectedFile || isUploading}>
          {isUploading ? "Uploading..." : "Send to backend"}
        </button>
        <button type="button" className="ghost" onClick={() => setSelectedFile(null)} disabled={isUploading}>
          Clear selection
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {result && (
        <div className="result">
          <p className="success">{result.message}</p>
          <p className="meta">File name: {result.fileName}</p>
          <p className="meta">File size: {(result.fileSize / (1024 * 1024)).toFixed(2)} MB</p>
        </div>
      )}
    </form>
  );
}
