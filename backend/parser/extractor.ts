import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { loadPdfText, loadPdfTextFromBuffer } from "./pdfLoader.ts";
import { OfferExtractionSchema, type OfferExtraction } from "../domain/models/offerSchemas.js";
import { EXTRACTION_PROMPT } from "./prompts.ts";

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
  return OfferExtractionSchema.parse(parsed);
}

export async function extractProcurementOfferFromPath(pdfPath: string): Promise<OfferExtraction> {
  const offerText = await loadPdfText(pdfPath);
  return extractFromText(offerText);
}

export async function extractProcurementOfferFromBuffer(buffer: Buffer): Promise<OfferExtraction> {
  const offerText = await loadPdfTextFromBuffer(buffer);
  return extractFromText(offerText);
}
