import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { loadPdfText } from "./pdfLoader.ts";
import { OfferExtractionSchema } from "../domain/models/offerSchemas.js";
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


export async function extractProcurementOffer(pdfPath: string) {
  try {
    console.log(`Loading PDF from: ${pdfPath}`);
    const offerText = await loadPdfText(pdfPath);
    console.log(`PDF loaded successfully. Text length: ${offerText.length}`);

    const prompt = createChatPrompt();
    const llm = createLanguageModel();
    const chain = prompt.pipe(llm);

    console.log("Invoking LLM...");
    const response = await chain.invoke({ offerText });
    console.log("LLM response received");

    const rawContent = extractJsonContent(response.content);
    console.log(`Raw content extracted. Length: ${rawContent.length}`);

    const cleanedJson = cleanJsonString(rawContent);
    console.log("JSON cleaned successfully");

    console.log(cleanedJson);
    return cleanedJson;
  } catch (error) {
    console.error("Error in extractProcurementOffer:", error);
    throw error;
  }
}
