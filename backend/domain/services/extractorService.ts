import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { loadPdfText, loadPdfTextFromBuffer } from "./pdfLoaderService.ts";
import { OfferExtractionSchema, type OfferExtraction } from "../models/offerSchemas.js";
import { EXTRACTION_PROMPT } from "../../parser/prompts.ts";
import { logError } from "../../utils/logger.js";
import type { Worker } from "tesseract.js";

const OPENAI_MODEL = "gpt-4.1-mini";
const OPENAI_TEMPERATURE = 0;

function createChatPrompt(): ChatPromptTemplate {
  return ChatPromptTemplate.fromMessages([
    ["system", EXTRACTION_PROMPT],
    ["user", "Extract the data from this vendor offer:\n\n{offerText}"],
  ]);
}

function createLanguageModel(): ChatOpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  return new ChatOpenAI({ model: OPENAI_MODEL, temperature: OPENAI_TEMPERATURE });
}

function extractJsonContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content) && content.length > 0) {
    const firstItem = content[0] as Record<string, unknown>;
    return (firstItem.text as string) ?? "";
  }

  return "";
}

function cleanJsonString(raw: string): string {
  let cleaned = raw.trim();

  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/^```(json)?/i, "")
      .replace(/```$/, "")
      .trim();
  }

  return cleaned;
}

async function extractFromText(offerText: string): Promise<OfferExtraction> {
  const prompt = createChatPrompt();
  const llm = createLanguageModel();
  const chain = prompt.pipe(llm);

  const response = await chain.invoke({ offerText });
  const rawContent = extractJsonContent(response.content);
  const cleanedJson = cleanJsonString(rawContent);

  const parsed = JSON.parse(cleanedJson);
  const validated = OfferExtractionSchema.parse(parsed);
  // For now hardcoded, should be taken from logged in user account
  validated.requestorDepartment = "HR"
  return validated
}

export async function extractProcurementOffer(buffer: Buffer): Promise<OfferExtraction> {
  try {
    const offerText = await loadPdfTextFromBuffer(buffer);
    const extraction = await extractFromText(offerText);
    const issues = validateExtraction(extraction);
    if (issues.length > 0) {
      logError("Extraction validation failed", new Error("Validation errors"), { issues, extraction });
    }
    return extraction;
  } catch (error) {
    logError("Failed to extract procurement offer from buffer", error);
    throw error;
  }
}

export async function extractFromImage(buffer: Buffer): Promise<string> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker();
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    const { data } = await worker.recognize(buffer);
    await worker.terminate();
    return data.text;
  } catch (error) {
    logError("Failed to extract text from image buffer", error);
    throw error;
  }
}

export function validateExtraction(extraction: OfferExtraction): string[] {
  const issues: string[] = [];

  const checkString = (value: string | null | undefined, field: string) => {
    if (!value || value.trim().length === 0) {
      issues.push(field);
    }
  };

  checkString(extraction.requestor, "requestor");
  checkString(extraction.requestorDepartment, "requestorDepartment");
  checkString(extraction.vendor, "vendor");
  checkString(extraction.commodityGroup, "commodityGroup");
  checkString(extraction.description, "description");
  checkString(extraction.vatId, "vatId");

  if (!extraction.orderLines || extraction.orderLines.length === 0) {
    issues.push("orderLines");
  } else {
    extraction.orderLines.forEach((line, index) => {
      if (!line.product) issues.push(`orderLines[${index}].product`);
      if (line.unitPrice === null || line.unitPrice === undefined || !Number.isFinite(line.unitPrice)) {
        issues.push(`orderLines[${index}].unitPrice`);
      }
      if (line.quantity === null || line.quantity === undefined || !Number.isFinite(line.quantity)) {
        issues.push(`orderLines[${index}].quantity`);
      }
      if (line.totalCost === null || line.totalCost === undefined || !Number.isFinite(line.totalCost)) {
        issues.push(`orderLines[${index}].totalCost`);
      }
    });
  }

  if (extraction.totalCost === null || extraction.totalCost === undefined || !Number.isFinite(extraction.totalCost)) {
    issues.push("totalCost");
  }

  return issues;
}
