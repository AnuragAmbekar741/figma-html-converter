/**
 * Generate prompt for converting Figma file data to HTML
 */
export function getFigmaToHTMLPrompt(compactJSON: string): string {
  return `You are an expert web developer. Convert this Figma design data into clean, semantic HTML with inline CSS.

Figma Design Data:
${compactJSON}

Requirements:
1. Generate complete, valid HTML5 document
2. Use semantic HTML elements (header, nav, main, section, article, footer, etc.)
3. Apply inline CSS styles based on the Figma design properties
4. Preserve layout structure (use flexbox or grid as appropriate)
5. Convert colors from RGB (0-1 range) to hex format
6. Include responsive design considerations
7. Add comments for major sections
8. Ensure the HTML is production-ready and well-formatted

Generate the HTML:`;
}

/**
 * Generate prompt for converting extracted Figma data to HTML
 * Used for testing with pre-extracted data
 */
export function getExtractedDataToHTMLPrompt(compactJSON: string): string {
  return `You are an expert web developer. Convert this Figma design data into clean, semantic HTML with inline CSS.

Figma Design Data:
${compactJSON}

CRITICAL REQUIREMENTS:
1. Generate complete, valid HTML5 document starting with <!DOCTYPE html>
2. Use semantic HTML elements (header, nav, main, section, article, footer, etc.)
3. Apply inline CSS styles based on the Figma design properties
4. Preserve layout structure (use flexbox or grid as appropriate)
5. COLORS - USE HEX VALUES DIRECTLY: All colors in the data have been pre-converted to hex format:
   - Use the "hex" property directly for all colors (fills, backgroundColor, strokes, gradientStops)
   - Example: If you see "hex": "#95228C", use it directly as #95228C
   - DO NOT convert RGB values - use the hex values provided
6. GRADIENTS - USE HEX VALUES: If fills contain gradientStops with hex values:
   - Use the hex property from each gradientStop
   - Convert position (0-1) to percentage (multiply by 100)
   - Example: gradientStops: [{hex: "#95228C", position: 0}, {hex: "#3A3CB3", position: 1}]
   - CSS: background: linear-gradient(to right, #95228C 0%, #3A3CB3 100%);
7. BACKGROUND: Use the backgroundColorHex for body background if provided
8. POSITIONING - CRITICAL: Use absolute positioning based on x, y coordinates from the data:
   - The main container should be position: relative
   - ALL child elements with x, y coordinates MUST use position: absolute with left: xpx, top: ypx
   - Example: If a button has x: 16, y: 662, use: position: absolute; left: 16px; top: 662px;
   - DO NOT use flexbox margins or padding for positioning - use the exact x, y coordinates provided
   - The x, y coordinates are relative to the parent container
   - Width and height should also be used from the data: width: 361px, height: 46px
   - For TEXT nodes with textAlignHorizontal: "CENTER" and a width, use: left: xpx; width: widthpx; text-align: center;
9. INPUT FIELDS - CRITICAL STRUCTURE:
   - When you see two FRAME nodes that are siblings with cornerRadii that create a combined rounded rectangle:
     * Top frame has cornerRadii: [8, 8, 0, 0] (top-left: 8px, top-right: 8px, bottom-right: 0, bottom-left: 0)
     * Bottom frame has cornerRadii: [0, 0, 8, 8] (top-left: 0, top-right: 0, bottom-right: 8px, bottom-left: 8px)
   - These should be combined into a SINGLE input container with:
     * border-radius: 8px (uniform for the whole container)
   - TEXT NODES INSIDE INPUT FRAMES: TEXT nodes that are children of input frames represent the placeholder text:
     * Use the TEXT node's "characters" property as the placeholder attribute of the <input> element
     * Use the TEXT node's "hex" color for the placeholder color (CSS: ::placeholder { color: #hex; })
     * DO NOT create separate label elements for TEXT nodes inside input frames
     * Example: If a TEXT node inside an input frame has characters: "Password" and hex: "#C0C0C0", use: <input type="password" placeholder="Password" style="::placeholder { color: #C0C0C0; }">
   - Create actual <input> elements with type="text" or type="password"
   - The frames have padding (paddingLeft, paddingRight, paddingTop, paddingBottom) - apply this to the input container
   - The frames have strokes (borders) with hex colors - apply this as border on the input container
   - DO NOT create separate divs for each input - combine them into one container
10. LAYOUT: For auto-layout frames (layoutMode: HORIZONTAL/VERTICAL), use flexbox INSIDE the absolutely positioned container
11. Include responsive design considerations with viewport meta tag
12. Add comments for major sections
13. Ensure the HTML is production-ready and well-formatted
14. IMPORTANT: Return ONLY the HTML code, no markdown formatting, no explanations, just the raw HTML starting with <!DOCTYPE html>

Generate the HTML:`;
}
