import { ChatOpenAI } from "@langchain/openai";
import { langchainConfig } from "../config/langchain.config";
import { FigmaExtractorService } from "./figma-extractor.service";

export class LangChainService {
  private llm: ChatOpenAI;
  private figmaExtractor: FigmaExtractorService;

  constructor() {
    if (!langchainConfig.openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.llm = new ChatOpenAI({
      modelName: langchainConfig.modelName,
      temperature: langchainConfig.temperature,
      maxTokens: langchainConfig.maxTokens,
      openAIApiKey: langchainConfig.openaiApiKey,
    });

    // Initialize Figma extractor service
    this.figmaExtractor = new FigmaExtractorService();
  }

  getLLM(): ChatOpenAI {
    return this.llm;
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

    // Step 3: Create prompt with extracted data
    const prompt = `Convert this extracted Figma design data to a complete HTML page with inline CSS.

## DATA FORMAT
The JSON contains a "pages" array. Each page has nodes with these properties:
- type: DOCUMENT, CANVAS, FRAME, TEXT, RECTANGLE
- x, y: absolute position in pixels
- width, height: dimensions in pixels
- fills: array of backgrounds (SOLID with {r,g,b,a} 0-1 range and optional hex, or GRADIENT_LINEAR/GRADIENT_RADIAL with gradientStops)
- backgroundColor: background color for FRAME nodes (with optional backgroundColorHex)
- strokes: border colors (with hex), strokeWeight: border width
- cornerRadius or cornerRadii: [topLeft, topRight, bottomRight, bottomLeft]
- characters: text content (for TEXT nodes)
- fontSize, fontFamily, fontWeight, textAlignHorizontal, letterSpacing, lineHeightPx: typography
- layoutMode: "VERTICAL" or "HORIZONTAL" (flexbox direction)
- paddingLeft/Right/Top/Bottom, itemSpacing: spacing
- children: nested nodes
- opacity: transparency (0-1)
- effects: shadows/blurs (optional)

## CONVERSION RULES
1. Colors: Use hex values if provided, otherwise convert {r,g,b,a} (0-1 range) to CSS rgba(). Formula: rgba(r*255, g*255, b*255, a)
2. Gradients: Convert gradientStops to CSS linear-gradient. Use position (0-1) as percentage. Use hex if available.
3. Position: Use position:absolute with left:Xpx, top:Ypx relative to parent FRAME
4. The root FRAME should be centered on page using flexbox on body
5. Use canvasBackground for body background color (from first page)
6. cornerRadii [a,b,c,d] → border-radius: apx bpx cpx dpx (top-left, top-right, bottom-right, bottom-left)
7. layoutMode:"VERTICAL" → display:flex; flex-direction:column
8. layoutMode:"HORIZONTAL" → display:flex; flex-direction:row
9. itemSpacing → gap property for flex children
10. Skip DOCUMENT and CANVAS nodes - start from first FRAME in pages[0]
11. Use semantic HTML: h1 for large headlines, button for clickable elements, input for form fields
12. Apply opacity if present: opacity: value
13. Apply effects (shadows) if present: box-shadow for DROP_SHADOW effects. Skip BACKGROUND_BLUR effects.

## SPECIAL HANDLING FOR INPUT FIELDS
When a FRAME node has:
- A stroke (border) AND
- Contains only one child which is a TEXT node AND
- The parent is a VERTICAL layout FRAME containing multiple such frames

Then convert it to an <input> element:
- Use the TEXT node's "characters" as the placeholder attribute
- Use the TEXT node's color (from fills) for the placeholder color via ::placeholder CSS
- Apply the FRAME's cornerRadii to the input's border-radius
- Apply the FRAME's stroke color and strokeWeight as the input's border
- Apply the FRAME's paddingLeft/Right/Top/Bottom as the input's padding
- Position the input using the FRAME's x, y, width, height
- The parent VERTICAL FRAME should be a container div (not an input group)

## NESTED STRUCTURE HANDLING
- When a FRAME contains only a TEXT node, consider if it should be an input field (see above) or just a text element
- For buttons: If a FRAME has a gradient/solid fill and contains a TEXT node, convert to <button> with the text as button content
- Preserve the hierarchy: parent FRAME → child FRAME → TEXT node should be converted appropriately based on context

## OUTPUT FORMAT
Return ONLY valid HTML starting with <!DOCTYPE html> and ending with </html>.
NO markdown code blocks. NO explanations. NO text before or after the HTML.

## FIGMA DATA
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
