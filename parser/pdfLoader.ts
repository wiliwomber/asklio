import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import type { Document } from "@langchain/core/documents";

export async function loadPdfText(path: string): Promise<string> {
  const loader = new PDFLoader(path, { splitPages: true });
  const docs: Document[] = await loader.load();
  return docs.map(d => d.pageContent).join("\n\n");
}
