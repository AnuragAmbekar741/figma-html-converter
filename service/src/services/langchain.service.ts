import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { langchainConfig } from "../config/langchain.config";
import { FigmaExtractorService } from "./figma-extractor.service";
import {
  getPromptFinal,
  getPromptFinal2,
  getPromptFinalDesignSystem,
  getPromptThree,
  getPromptTwo,
} from "../utils/prompt";

type LLMProvider = ChatOpenAI | ChatGoogleGenerativeAI;

export class LangChainService {
  private llm: LLMProvider;
  private provider: "openai" | "gemini";
  private figmaExtractor: FigmaExtractorService;

  constructor(provider?: "openai" | "gemini") {
    // Use provided provider or default from config
    this.provider =
      provider || (langchainConfig.provider as "openai" | "gemini") || "gemini";

    if (this.provider === "openai") {
      if (!langchainConfig.openaiApiKey) {
        throw new Error("OPENAI_API_KEY is not set in environment variables");
      }

      this.llm = new ChatOpenAI({
        modelName: langchainConfig.openaiModelName,
        temperature: langchainConfig.openaiTemperature,
        maxTokens: langchainConfig.openaiMaxTokens,
        openAIApiKey: langchainConfig.openaiApiKey,
      });
      console.log(
        `[LangChain] Using OpenAI model: ${langchainConfig.openaiModelName}`
      );
    } else {
      if (!langchainConfig.googleApiKey) {
        throw new Error("GOOGLE_API_KEY is not set in environment variables");
      }

      this.llm = new ChatGoogleGenerativeAI({
        model: langchainConfig.geminiModelName,
        temperature: langchainConfig.geminiTemperature,
        maxOutputTokens: langchainConfig.geminiMaxTokens,
        apiKey: langchainConfig.googleApiKey,
      });
      console.log(
        `[LangChain] Using Gemini model: ${langchainConfig.geminiModelName}`
      );
    }

    // Initialize Figma extractor service
    this.figmaExtractor = new FigmaExtractorService();
  }

  getLLM(): LLMProvider {
    return this.llm;
  }

  getProvider(): "openai" | "gemini" {
    return this.provider;
  }

  async testConnection(): Promise<string> {
    try {
      const response = await this.llm.invoke(
        "Say 'Hello, LangChain is working!' in one sentence."
      );
      return response.content as string;
    } catch (error) {
      console.error("LangChain connection test failed:", error);
      throw error;
    }
  }

  /**
   * Extract HTML from LLM response (removes markdown formatting)
   */
  private extractHTMLFromResponse(response: string): string {
    // Try to extract HTML from markdown code blocks
    const htmlCodeBlockMatch = response.match(/```(?:html)?\s*([\s\S]*?)```/i);
    if (htmlCodeBlockMatch && htmlCodeBlockMatch[1]) {
      const html = htmlCodeBlockMatch[1].trim();
      if (html.includes("<!DOCTYPE") || html.includes("<html")) {
        return html;
      }
    }

    // Try to extract complete HTML document
    const htmlDocumentMatch = response.match(/(<!DOCTYPE[\s\S]*?<\/html>)/i);
    if (htmlDocumentMatch && htmlDocumentMatch[1]) {
      return htmlDocumentMatch[1].trim();
    }

    // Try to find HTML tag anywhere
    const htmlTagMatch = response.match(/(<html[\s\S]*?<\/html>)/i);
    if (htmlTagMatch && htmlTagMatch[1]) {
      return htmlTagMatch[1].trim();
    }

    // Find HTML starting point if embedded in text
    if (response.includes("<!DOCTYPE") || response.includes("<html")) {
      const startIndex = Math.max(
        response.indexOf("<!DOCTYPE"),
        response.indexOf("<html")
      );
      if (startIndex !== -1) {
        const htmlSubstring = response.substring(startIndex);
        const endMatch = htmlSubstring.match(/([\s\S]*?<\/html>)/i);
        if (endMatch && endMatch[1]) {
          return endMatch[1].trim();
        }
        return htmlSubstring.trim();
      }
    }

    // Return as-is if no pattern matches
    return response.trim();
  }

  /**
   * Convert Figma file data to HTML using LLM
   * Uses FigmaExtractorService to minimize token usage
   */
  async convertFigmaToHTML(figmaFileData: any): Promise<string> {
    // Step 1: Extract essential data using FigmaExtractorService
    const extractedData =
      this.figmaExtractor.extractEssentialData(figmaFileData);

    // Step 2: Convert to compact JSON (removes null/undefined values)
    const figmaJSON = this.figmaExtractor.toCompactJSON(extractedData);

    // Log for debugging
    console.log(
      "Original data size:",
      JSON.stringify(figmaFileData).length,
      "characters"
    );
    console.log("Extracted data size:", figmaJSON.length, "characters");
    console.log(`[LangChain] Using ${this.provider} for conversion`);

    // Step 3: Create prompt with extracted data
    const promptFinal = getPromptFinal();
    const prompt = `
  ${promptFinal}
  Figma JSON:
  ${figmaJSON}`;

    try {
      // Step 4: Send to LLM and wait for response
      const response = await this.llm.invoke(prompt);

      // Step 5: Extract the text content
      const rawResponse = response.content as string;

      // Step 6: Clean up the response to get pure HTML
      return this.extractHTMLFromResponse(rawResponse);
    } catch (error) {
      console.error("Error converting Figma to HTML:", error);
      throw error;
    }
  }
}
