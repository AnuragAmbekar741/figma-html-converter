import { ChatOpenAI } from "@langchain/openai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { langchainConfig } from "../config/langchain.config";
import { FigmaExtractorService } from "./figma-extractor.service";
import { getPromptTwo } from "../utils/prompt";

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
    const prompt = `
ROLE:
YOU ARE AN EXPERT FRONT-END ENGINEER.
YOUR JOB IS TO CONVERT THE GIVEN Figma JSON (FROM Figma get-file API) INTO ONE HTML PAGE THAT MATCHES THE DESIGN EXACTLY.

PROCESS:
1. Understand the design and the json input and what you need to do to build eg form, landing page, etc.
2. This will help you to build the html accordingly and choose the right html elements and css properties.
3. Make sure you map exact figma json to html elements and css properties.
4. Build the html accordingly and choose the right html elements and css properties.
5. Make sure all child nodes are mapped to parent nodes in right direction.
6. Make sure spacing from x and y direction to child frames are mapped with input json wrt to parent frames.
6. Map cornerRadii [a,b,c,d] → border-radius: apx bpx cpx dpx (top-left, top-right, bottom-right, bottom-left)
7. Do not add any unnecessary spaces between element if not present in input json.

OUTPUT:
Return ONLY a full HTML document (<!DOCTYPE html>…</html>) with inline styles (+ the single optional <style> block / <link>).
No markdown, no commentary.

FIGMA JSON:
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

// ROLE
// Expert front-end engineer. Convert the Figma JSON into ONE HTML page that matches the design EXACTLY. Use inline styles; allow ONE tiny <style> block for ::placeholder and UA resets (and a Google Fonts <link> if allowed).

// HARD RULES
// - 1:1 node→element. No invented content. Use px positions/sizes from absoluteBoundingBox. Center the root frame in <body> (flex, min-height:100vh). Root is position:relative with the frame’s size. Z-order = child order. If a style is missing, skip it.

// RENDERING
// - Colors: prefer hex; else rgba(round(r*255),round(g*255),round(b*255),a).
// - Fills: SOLID→background-color; GRADIENT_*→background-image using gradientStops (pos×100%); angle from gradientHandlePositions when present, else 135deg.
// - Strokes: border: strokeWeight px solid <strokeColor>. Corners: cornerRadius or [tl,tr,br,bl]→border-radius.
// - Opacity→opacity. DROP/INNER_SHADOW→box-shadow. Ignore blurs.
// - Auto-layout: display:flex; flex-direction from layoutMode; padding from padding*; gap from itemSpacing; align from axis settings.
// - TEXT: render characters; escape HTML; apply fontFamily, fontSize, fontWeight, lineHeightPx, letterSpacing, color, text-align.

// FONTS (STRICT)
// - Collect families+weights from TEXT nodes; include ONE Google Fonts <link> (display=swap) and apply to all elements & ::placeholder. If links disallowed, still apply exact family + fallback stack.

// PLACEHOLDER vs REAL TEXT (STRICT)
// - If a light/low-contrast TEXT node (e.g., #E0E0E0/#D9D9D9/#BDBDBD/#A1A1A1 or opacity<1), named “placeholder/hint”, or sample-like (“mail@…”, “Password”, “••••”, “*******”) is INSIDE an input rectangle:
//     → Use it as <input placeholder="…">; do NOT overlay text. Style ::placeholder to match JSON.
// - Labels ABOVE/OUTSIDE the rectangle or higher-contrast label colors (e.g., #828282) → <label for="…">.
// - Inputs have empty value unless JSON encodes a real value.

// MICRO-POLISH (non-visual only)
// - You may add: fex design micro polish rules.

// OUTPUT
// Return ONLY a full HTML document (<!DOCTYPE html>…</html>) with inline styles (+ the single optional <style> block / <link>). No markdown, no commentary.

// FIGMA JSON:
