import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { Document } from "@langchain/core/documents";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function loadPdfText(path: string): Promise<string> {
  const loader = new PDFLoader(path, { splitPages: true });
  const docs: Document[] = await loader.load();
  return docs.map((d) => d.pageContent).join("\n\n");
}

export async function loadPdfTextFromBuffer(buffer: Buffer): Promise<string> {
  const parsed = await pdfParse(buffer);
  return parsed.text;
}
