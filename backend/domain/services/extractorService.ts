import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { loadPdfText, loadPdfTextFromBuffer } from "./pdfLoaderService.ts";
import { OfferExtractionSchema, type OfferExtraction } from "../models/offerSchemas.js";
import { EXTRACTION_PROMPT } from "../../parser/prompts.ts";
import { logError } from "../../utils/logger.js";

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

export async function extractProcurementOffer(buffer: Buffer): Promise<OfferExtraction> {
  try {
    const offerText = await loadPdfTextFromBuffer(buffer);
    return await extractFromText(offerText);
  } catch (error) {
    logError("Failed to extract procurement offer from buffer", error);
    throw error;
  }
}
