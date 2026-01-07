import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { Document } from "@langchain/core/documents";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { logError } from "../../utils/logger.js";

export async function loadPdfText(path: string): Promise<string> {
  try {
    const loader = new PDFLoader(path, { splitPages: true });
    const docs: Document[] = await loader.load();
    return docs.map((d) => d.pageContent).join("\n\n");
  } catch (error) {
    logError("Failed to load PDF text from path", error, { path });
    throw error;
  }
}

export async function loadPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const parsed = await pdfParse(buffer);
    return parsed.text;
  } catch (error) {
    logError("Failed to load PDF text from buffer", error);
    throw error;
  }
}
