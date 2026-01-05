import "dotenv/config";
import { extractProcurementOffer } from "./parser/extractor.js";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const INPUT_DOCS_DIR = "input_docs";
const PDF_FILE = "AN-4120-Kdnr-14918.pdf";

async function main(): Promise<void> {
  try {
    const docPath = path.join(__dirname, INPUT_DOCS_DIR, PDF_FILE);
    const result = await extractProcurementOffer(docPath);
    console.log("Extraction successful:", JSON.stringify(result, null, 2));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to extract procurement offer:", errorMessage);
    process.exit(1);
  }
}

main();
