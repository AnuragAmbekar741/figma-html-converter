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

export const getPromptOne = () => {
  return `
  Convert this extracted Figma design data to a complete HTML page with inline CSS.

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
3. The root FRAME should be centered on page using flexbox on body
5. cornerRadii [a,b,c,d] → border-radius: apx bpx cpx dpx (top-left, top-right, bottom-right, bottom-left)
6. layoutMode:"VERTICAL" → display:flex; flex-direction:column
7. layoutMode:"HORIZONTAL" → display:flex; flex-direction:row
8. Apply opacity if present: opacity: value
9. Apply effects (shadows) if present: box-shadow for DROP_SHADOW effects. Skip BACKGROUND_BLUR effects.
10. Skip DOCUMENT and CANVAS nodes - start from first FRAME in pages[0]
11. Apply opacity if present: opacity: value
12. Apply effects (shadows) if present: box-shadow for DROP_SHADOW effects. Skip BACKGROUND_BLUR effects.

## TEXT ALIGNMENT
- For TEXT nodes with textAlignHorizontal:"CENTER", use: left: Xpx; width: Wpx; text-align: center; (where X is the x coordinate and W is the width from absoluteBoundingBox)
- This ensures centered text is properly positioned and centered within its container

## OUTPUT FORMAT
Return ONLY valid HTML starting with <!DOCTYPE html> and ending with </html>.
NO markdown code blocks. NO explanations. NO text before or after the HTML.

## FIGMA DATA
  `;
};

export const getPromptTwo = () => {
  return `
You are a Figma-to-HTML renderer. Your ONLY job is to convert the given Figma JSON into a single, self-contained HTML page that visually matches the design as closely as possible.

# GOAL
- Reconstruct the layout, sizes, spacing, colors, typography, corners, and gradients so the HTML looks **pixel-perfect** compared to the Figma design.
- Do NOT simplify, rearrange, or “clean up” the design. Reproduce what is in the JSON.

# INPUT FORMAT (FIGMA JSON)
The JSON is a Figma file response (or a simplified extract) and may include:
- document / pages / children hierarchy
- Node types: DOCUMENT, CANVAS, FRAME, GROUP, RECTANGLE, TEXT, VECTOR, etc.
- Common properties:
  - type
  - children: nested nodes
  - absoluteBoundingBox: { x, y, width, height }
  - fills: array of paints (SOLID, GRADIENT_LINEAR, GRADIENT_RADIAL)
  - strokes, strokeWeight, strokeAlign
  - cornerRadius or rectangleCornerRadii [topLeft, topRight, bottomRight, bottomLeft]
  - layoutMode: "VERTICAL" or "HORIZONTAL" for auto-layout frames
  - paddingLeft/Right/Top/Bottom, itemSpacing
  - opacity
  - effects (DROP_SHADOW, etc.)
  - For TEXT: characters, style { fontFamily, fontSize, fontWeight, textAlignHorizontal, letterSpacing, lineHeightPx, ... }

If there is a DOCUMENT or CANVAS level, treat the first top-level FRAME as the main artboard. If there is a "pages" array, treat pages[0]’s first FRAME as the root artboard.

# OUTPUT REQUIREMENTS
- Return ONLY valid HTML, starting with <!DOCTYPE html> and ending with </html>.
- NO markdown, NO backticks, NO explanations.
- Include all CSS as inline styles on elements OR inside a single <style> tag in the <head>. Do NOT use external CSS files.
- Do NOT include any placeholder text or elements that are not present in the JSON.

# ROOT LAYOUT
- The root artboard/frame (the main screen) should be centered in the browser window.
- Use the artboard’s width/height from its absoluteBoundingBox as the HTML canvas size.
- Suggested body styles:
  - margin: 0;
  - min-height: 100vh;
  - display: flex;
  - align-items: center;
  - justify-content: center;
  - background-color: #ffffff (or any page background if specified).
- Wrap the whole design in a single main container <div> that represents the root FRAME.
  - Set its width, height, background-color/fill, border-radius, etc. from that FRAME.

# GENERAL RENDERING RULES

## 1. Positioning & Sizing
- For nodes with absoluteBoundingBox, use:
  - position: absolute;
  - left: x px; top: y px;
  - width: width px; height: height px;
- The main root container can use position: relative; and all children absolutely positioned inside it.
- Respect the stacking order based on child order:
  - Earlier children are rendered first (behind).
  - Later children are on top.

## 2. Layout Mode (Auto-Layout Frames)
If a FRAME has layoutMode:
- layoutMode: "VERTICAL" → display: flex; flex-direction: column;
- layoutMode: "HORIZONTAL" → display: flex; flex-direction: row;
- Apply:
  - padding-left/right/top/bottom → padding: TOPpx RIGHTpx BOTTOMpx LEFTpx;
  - itemSpacing → gap: itemSpacing px;
  - counterAxisAlignItems / primaryAxisAlignItems:
    - "CENTER" → align-items: center; or justify-content: center; depending on axis.
- For auto-layout frames, you may still set position: absolute with top/left from absoluteBoundingBox if needed, but let flex handle internal arrangement.

## 3. Colors
Use hex if provided; otherwise convert RGBA:
- Figma uses 0–1 floats: color: { r, g, b, a }
- Convert to CSS as:
  - rCss = Math.round(r * 255)
  - gCss = Math.round(g * 255)
  - bCss = Math.round(b * 255)
  - CSS: rgba(rCss, gCss, bCss, a)
- If a "backgroundColorHex" or hex field exists, prefer that as background-color.
- For fills:
  - If there are multiple fills, use the topmost visible one (usually the last).

## 4. Gradients
For GRADIENT_LINEAR or GRADIENT_RADIAL:
- Use gradientStops array:
  - Each stop has color (same RGBA rules) and position 0–1.
- Convert to CSS linear-gradient:
  - Example: background: linear-gradient(90deg, color1 0%, color2 100%);
- Use the stop positions as percentages: position * 100%.
- If gradient direction is not trivial, you may assume a generic angle (e.g., 135deg) if you cannot compute from gradientHandlePositions.

## 5. Borders & Corners
- strokes + strokeWeight:
  - If strokes is non-empty and visible, use:
    - border: strokeWeight px solid <strokeColor>;
  - Use the first stroke or the last one if multiple.
- cornerRadius:
  - cornerRadius: R → border-radius: Rpx;
- rectangleCornerRadii / cornerRadii [tl, tr, br, bl]:
  - border-radius: tlpx trpx brpx blpx;

## 6. Opacity & Effects
- If a node has "opacity", apply: opacity: value;
- For effects:
  - For DROP_SHADOW, map to CSS box-shadow:
    - Use color, offset, radius from the effect.
  - Ignore BACKGROUND_BLUR and other unsupported effect types.

# NODE-TYPE RULES

## FRAME / GROUP
- Render as <div>.
- Apply:
  - position, top, left, width, height
  - background (from fills / backgroundColor)
  - border-radius, border, box-shadow, opacity
  - layoutMode → flex styles if present
- Recursively render children inside.

## RECTANGLE / VECTOR (simple shapes)
- Render as <div>.
- Apply same styles as FRAME: size, position, background-color / gradient, border-radius, stroke, etc.

## TEXT
- Render as <div> or <p> (prefer <div>).
- Content is the "characters" string.
- Apply typography from style:
  - font-family
  - font-size
  - font-weight
  - line-height (use lineHeightPx if present)
  - letter-spacing
- Color:
  - From fills[0] if type SOLID.
- Text alignment:
  - textAlignHorizontal:
    - "LEFT" → text-align: left;
    - "CENTER" → text-align: center;
    - "RIGHT" → text-align: right;
- Positioning:
  - Use absoluteBoundingBox x, y, width, height like other nodes.
  - For centered text (textAlignHorizontal:"CENTER"):
    - left: x px; width: width px; text-align: center;
- Do NOT change the text content other than escaping HTML characters.

# SPECIAL INSTRUCTIONS
- Do NOT invent elements, buttons, or labels that are not in the JSON.
- Do NOT change copy, colors, or spacing.
- If a property is missing, skip it rather than guessing.
- If a node type is unknown or unsupported, you may ignore it.
- Always prioritize matching size, position, and color over semantic correctness.

# FINAL OUTPUT
- Return a complete HTML document:
  - <!DOCTYPE html>
  - <html> with <head> and <body>
  - <head> may include <meta charset="UTF-8"> and a <style> block if you prefer.
  - <body> must contain the rebuilt layout.
- Again: NO markdown, NO backticks, NO commentary. Only raw HTML.

# FIGMA JSON
Below is the Figma JSON. Use it to build the HTML:

`;
};
