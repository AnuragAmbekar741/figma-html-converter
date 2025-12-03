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

export const getPromptThree = () => {
  return `
Role:
You are an expert front‑end engineer. Your job is to convert the given Figma JSON into a single, self‑contained HTML page that visually matches the design as closely as possible (pixel‑perfect).

Follow these steps to convert the Figma JSON to HTML:

Step 1: Identify root container
  - Find the first FRAME node in pages[0].children (or the root FRAME if structure differs).
  - Extract: x, y, width, height, backgroundColor/backgroundColorHex, cornerRadius.
  - This FRAME is the main container <div>.
  - Center this container in body using:
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background-color: <canvasBackground or page background>;
    }
  - Root container styles:
    - position: relative;
    - width: <width>px;
    - height: <height>px;
    - background-color: <backgroundColorHex>;
    - border-radius: <cornerRadius>px;

Step 2: Map child elements (absolute positioning)
  - Traverse all children of the root FRAME recursively.
  - For any node with x, y, width, height (or absoluteBoundingBox):
    * Use: position: absolute; left: <x>px; top: <y>px; width: <width>px; height: <height>px;
    * x, y are relative to the parent FRAME in the JSON (not the page).
    * Do NOT adjust, offset, or “fix” these coordinates.
  - Respect child order for z‑index:
    * Earlier children are behind; later children render on top.

Step 3: Handle grouped / connected siblings (pattern detection)
  - Detect a “stacked group” when:
    * Multiple sibling FRAME nodes share the same x;
    * Have the same width;
    * Have consecutive y values where (top.y + top.height) = bottom.y;
    * Have similar strokes/borders/backgrounds.
  - When this pattern is detected:
    * Treat these siblings as a vertically stacked group with NO gap.
    * If they are children of a parent FRAME P:
      - Parent container: position:absolute; left:P.x; top:P.y; width:P.width; height:P.height; (from JSON)
      - Each child FRAME C uses coordinates relative to parent:
        · left: 0;
        · top: C.y - P.y;
    * If there is no explicit parent, each child FRAME uses its own x,y directly.
    * If cornerRadii indicate top/bottom rounding:
      - Top element: border-radius from [a, b, 0, 0] → a b 0 0.
      - Bottom element: border-radius from [0, 0, c, d] → 0 0 c d.
      - Bottom element MUST have border-top: none so the border seam disappears.
    * Never add extra margin/gap between such siblings.

Step 4: Component mapping (pattern‑based)

  Input Fields (CRITICAL):
  - Detection:
    * A FRAME with:
      - visible stroke(s) and strokeWeight;
      - paddingLeft/Right/Top/Bottom;
      - at least one TEXT child
      → represents an input field.
  - TEXT children of an input FRAME:
    * MUST NOT be rendered as separate label <div>/<p>.
    * Instead they provide the input’s content.
    * Use TEXT.characters as either value= or placeholder=.
    * Decide placeholder vs value by color/opacity:
      - Light/low‑contrast (e.g. hex like #C0C0C0 or opacity < 0.7) → placeholder.
      - Dark/high‑contrast (e.g. #363341, opacity ≥ 0.8) → value.
  - Input type:
    * Contains "@" or "email" → type="email".
    * Contains "password", "•••", masked chars → type="password".
    * Digits only → type="number" or "tel".
    * Otherwise → type="text".
  - Structure for a single input FRAME F (with parent FRAME P, if any):
    * Container <div> for F:
      - If P exists and holds multiple inputs (layoutMode:"VERTICAL"):
        · Parent container:
          · position:absolute; left:P.x; top:P.y; width:P.width; height:P.height;
          · display:flex; flex-direction:column; (optional, but allowed)
        · Input container for F:
          · position:absolute; left:0; top:(F.y - P.y)px; width:F.widthpx; height:F.heightpx;
      - If no such parent: container uses F.x, F.y directly:
        · position:absolute; left:F.xpx; top:F.ypx; width:F.widthpx; height:F.heightpx;
      - Visual styles:
        · border:<strokeWeight>px solid <strokeColor>;
        · border-radius from F.cornerRadii or F.cornerRadius;
        · background-color from F.fills or transparent.
        · NO padding on the container; padding belongs to the input element.
    * Inner <input> element:
      - position:absolute; left:0; top:0; width:100%; height:100%;
      - border:none; outline:none; background:transparent;
      - padding: paddingTop paddingRight paddingBottom paddingLeft (from F).
      - Typography from TEXT child style:
        · font-family, font-size, font-weight, letter-spacing, lineHeightPx, color.
      - Set value= or placeholder= using TEXT.characters as determined above.
  - Never generate label elements or extra text nodes for TEXT that live inside an input FRAME.

  #Critical Rules:
    If a frame is identified as an input field, it must be rendered as a single input element with the value or placeholder set to the TEXT.name
    Do not create a separate label element for the TEXT.name. with div or any other element.
    
  Buttons (CRITICAL):
  - Detection:
    * FRAME with:
      - solid or gradient fill;
      - usually rounded corners;
      - a centered TEXT child;
      → map to a button‑like component.
  - Mapping:
    * Always render as <button>, NOT <div>.
    * <button> styles:
      - position:absolute; left:xpx; top:ypx; width:widthpx; height:heightpx;
      - background-color or background-image from fills (use hex/gradients);
      - border:none; border-radius from cornerRadius/cornerRadii;
      - display:flex; align-items:center; justify-content:center;
    * TEXT child:
      - Render inside button as <span> or direct text content.
      - Apply its fontFamily, fontSize, fontWeight, letterSpacing, lineHeightPx, color.
  - Secondary CTA frames (same pattern but different fill) may also be <button> if visually button‑like.

  Text Elements (Standalone):
  - TEXT that is NOT inside an input FRAME or button FRAME:
    * Map based on fontSize:
      - ≥ 32px → <h1> / <h2>.
      - 18–31px → <h2> / <h3>.
      - < 18px → <p> / <span>.
    * Position absolutely using x,y,width,height.
    * Apply typography:
      - font-family, font-size, font-weight, letter-spacing, lineHeightPx.
      - textAlignHorizontal:
        · "LEFT" → text-align:left;
        · "CENTER" → text-align:center; width:widthpx;
        · "RIGHT" → text-align:right; width:widthpx;
    * Content is exactly TEXT.characters (escape HTML), do not change wording.

  Container Elements:
  - FRAME or GROUP with children that is not clearly an input or button:
    * Render as <div> (or semantic <section>/<header>/<nav>/<footer> when obvious).
    * Position and size absolutely from x,y,width,height.
    * Apply background (fills/backgroundColor), borders, border-radius, opacity, shadows.
    * Optionally apply flexbox if layoutMode is set.

Step 5: Map styling properties

  Colors:
  - Prefer hex fields (hex, backgroundColorHex) when present.
  - Otherwise convert RGBA {r,g,b,a} (0–1) to CSS rgba:
    * rCss = Math.round(r * 255), etc.
    * Use rgba(rCss, gCss, bCss, a).
  - Use backgroundColorHex for FRAME backgrounds when available.

  Borders:
  - strokeWeight → border-width.
  - stroke color (prefer hex) → border-color.
  - cornerRadii [a,b,c,d] → border-radius: apx bpx cpx dpx (top-left, top-right, bottom-right, bottom-left).
  - cornerRadius single value → border-radius: Rpx.
  - For stacked siblings that visually form a single control:
    * Bottom element: border-top:none to remove the seam.

  Typography:
  - Apply fontFamily, fontSize, fontWeight, letterSpacing, lineHeightPx exactly.
  - Text alignment from textAlignHorizontal as described above.
  - Color from fills[0].hex or fills[0].color.

  Backgrounds & Fills:
  - SOLID fill → background-color.
  - GRADIENT_LINEAR / GRADIENT_RADIAL → background-image: linear-gradient(...) or radial-gradient(...).
  - For gradientStops:
    * Use stop.hex if present.
    * Use position * 100 as percentage.
    * Example: position:0 → 0%; position:1 → 100%.

  Effects:
  - DROP_SHADOW → box-shadow: offsetX offsetY blurRadius spreadRadius color.
  - INNER_SHADOW → box-shadow: inset offsetX offsetY blurRadius spreadRadius color.
  - Ignore BACKGROUND_BLUR and unsupported effects.

  Auto‑Layout (layoutMode):
  - layoutMode:"VERTICAL" → display:flex; flex-direction:column;
  - layoutMode:"HORIZONTAL" → display:flex; flex-direction:row;
  - itemSpacing → gap;
  - paddingLeft/Right/Top/Bottom → padding;
  - counterAxisAlignItems:"CENTER" → align-items:center;
  - primaryAxisAlignItems:"CENTER" → justify-content:center;
  - Still position the auto‑layout container itself absolutely using its x,y,width,height.

Step 6: Alignment and spacing rules
  - Elements with the same x in the JSON MUST share the same left in CSS (no manual tweaks).
  - Preserve all spacing implied by x,y,height: do not add margins/gaps unless they exist in JSON.
  - Do not “clean up” or re‑flow the layout; reproduce what you see in the data.

Step 7: Node hierarchy rules (CRITICAL)
  - TEXT inside input FRAME:
    * Never render as a separate element; only use it to set input value/placeholder.
  - TEXT inside button FRAME:
    * Render only inside the button; never create a duplicate outside.
  - TEXT that is a direct child of a container/root FRAME:
    * Render as a standalone text element as described in “Text Elements (Standalone)”.
  - Never duplicate text content: if it is used inside an input or button, do not repeat it elsewhere.

Output:
  - Return ONLY a complete HTML document (<!DOCTYPE html>…</html>) with inline styles.
  - You may include a single <style> block in <head> (e.g. resets, ::placeholder) and optional <link> for fonts.
  - No markdown, no commentary, no explanations, no extra text before or after the HTML.
  `;
};

export const getPromptFour = () => {
  return `
You are an expert front‑end engineer. Convert the given Figma JSON into ONE HTML page that visually matches the design pixel‑perfectly.

CRITICAL RULES:

1. POSITIONING (MANDATORY - ABSOLUTE POSITIONING ONLY):
   - Body MUST have: display: flex; justify-content: center; align-items: center; min-height: 100vh; background-color from canvasBackground; margin: 0;
   - Root FRAME: position:relative; width/height from JSON; NO padding; NO margin;
   - ALL child nodes with x, y, width, height properties MUST use INLINE styles:
     style="position:absolute; left:xpx; top:ypx; width:widthpx; height:heightpx;"
   - Use EXACT x, y, width, height values from JSON - never calculate or approximate.
   - FORBIDDEN: NEVER use margin, margin-top, margin-bottom, margin-left, margin-right, margin:auto, or any margin values ANYWHERE (not in inline styles, not in CSS classes, not in stylesheet).
   - FORBIDDEN: NEVER use padding on root container for spacing child elements.
   - FORBIDDEN: NEVER use flexbox gap, flexbox spacing, transform, calc(), or any layout spacing for positioning.
   - FORBIDDEN: NEVER define CSS classes with margin/padding properties in <style> tag - ALL positioning must be inline absolute.
   - FORBIDDEN: NEVER use CSS classes for positioning - only use classes for non-positioning styles (like font-family, colors) if needed.
   - Example CORRECT: <h1 style="position:absolute; left:32px; top:170px; width:154px; height:58px; font-size:48px;">Sign in</h1>
   - Example WRONG: <h1 class="headline">Sign in</h1> with CSS .headline { margin: 20px 0; }
   - Example WRONG: <div style="margin: 0 auto;"> or <div class="container" style="padding: 20px;">
   - Root container should NOT have padding - all children are absolutely positioned.

2. INPUT FIELDS:
   - Detection: FRAME with stroke + padding properties + TEXT child → <input> element.
   - TEXT inside input FRAME:
     * Light color (hex like #C0C0C0, #BDBDBD, or opacity < 0.7) → placeholder="<characters>"
     * Dark color (hex like #363341, #000000, or opacity ≥ 0.8) → value="<characters>"
     * CRITICAL: Dark text color means it's a VALUE, not a placeholder - use value attribute.
   - Input type detection:
     * TEXT.characters contains "@" or "email" → type="email"
     * TEXT.characters contains "password" or masked chars → type="password"
     * Otherwise → type="text"
   - Structure (MANDATORY - FOLLOW EXACTLY):
     * STEP 1: Check if input FRAMEs are children of a parent FRAME with layoutMode:"VERTICAL"
       - If YES: Create parent container div FIRST with INLINE styles:
         <div style="position:absolute; left:parent.x; top:parent.y; width:parent.width; height:parent.height; display:flex; flex-direction:column;">
       - If NO: Skip parent container, position inputs directly.
     * STEP 2: For each input FRAME:
       - If inside parent container: 
         <div style="position:absolute; left:0; top:(child.y - parent.y)px; width:child.width; height:child.height; border:1px solid strokeColor; border-radius:from cornerRadii;">
       - If no parent: 
         <div style="position:absolute; left:child.x; top:child.y; width:child.width; height:child.height; border:1px solid strokeColor; border-radius:from cornerRadii;">
       - Container div: NO padding on container (padding goes on input element).
       - Inner <input>: 
         <input style="position:absolute; left:0; top:0; width:100%; height:100%; border:none; padding:paddingTop paddingRight paddingBottom paddingLeft; ...">
   - CRITICAL: Do NOT create separate label/div/p/span for TEXT inside input - text goes ONLY in input value/placeholder attribute.

3. BUTTONS:
   - Detection: FRAME with (solid fill OR gradient fill) AND rounded corners AND TEXT child with action words.
   - Action words include: "Sign in", "Log in", "Login", "Create account", "Continue", "Next", "Submit", "Get started", "Start", "Confirm", "Done", "Save", "Cancel", "Delete", "Edit", "Add", "Remove", etc.
   - If detected as button:
     * Render as <button> element (NOT <div>).
     * Position absolutely with INLINE styles: 
       <button style="position:absolute; left:xpx; top:ypx; width:widthpx; height:heightpx; background:...; border-radius:...; display:flex; align-items:center; justify-content:center;">
     * FORBIDDEN: Do NOT use margin:auto, margin, or any margin values for button positioning.
     * TEXT.characters goes ONLY inside <button> as <span> or direct text - no duplicate labels outside.
     * CRITICAL: All buttons must be <button> elements, never <div> elements styled as buttons.

4. BORDER RADIUS MAPPING (CRITICAL):
   - If cornerRadius exists (single number) → border-radius: <cornerRadius>px;
   - If cornerRadii exists (array [a, b, c, d]) → border-radius: apx bpx cpx dpx;
     Where: a=top-left, b=top-right, c=bottom-right, d=bottom-left
   - Prefer cornerRadii over cornerRadius if both exist.
   - CRITICAL FOR GROUPED INPUTS:
     * When you see cornerRadii pattern where top element has [a, b, 0, 0] and bottom element has [0, 0, c, d]:
       - Top element: border-radius: apx bpx 0 0; (top corners only)
       - Bottom element: border-radius: 0 0 cpx dpx; border-top: none; (bottom corners only, NO top border)
     * Example: Top input cornerRadii: [8, 8, 0, 0] → border-radius: 8px 8px 0 0;
     * Example: Bottom input cornerRadii: [0, 0, 8, 8] → border-radius: 0 0 8px 8px; border-top: none;
     * The border-top:none is MANDATORY - if you forget it, the inputs will have a visible border seam between them.
     * ALWAYS check: if bottom input has cornerRadii [0, 0, c, d], it MUST have border-top: none;

5. GROUPED ELEMENTS (Pattern Detection):
   - If multiple sibling FRAMEs have: same x, same width, consecutive y (top.y + top.height = bottom.y), similar strokes:
     * Create parent container if they share a parent FRAME with layoutMode:"VERTICAL".
     * Parent container: position:absolute; left:parent.x; top:parent.y; width:parent.width; height:parent.height;
     * Each child: position relative to parent (left:0, top:relative-y where relative-y = child.y - parent.y).
     * Apply split border-radius:
       - Top element: Use only top corners from cornerRadii [a, b, 0, 0] → border-radius: apx bpx 0 0;
       - Bottom element: Use only bottom corners from cornerRadii [0, 0, c, d] → border-radius: 0 0 cpx dpx;
       - Bottom element MUST have: border-top: none; (to remove the border seam and visually connect)

6. TEXT ELEMENTS (Standalone):
   - TEXT node that is NOT inside input FRAME or button FRAME:
     * fontSize ≥ 32px → <h1> or <h2>
     * fontSize 18-31px → <h2> or <h3>
     * fontSize < 18px → <p> or <span>
   - Position absolutely with INLINE styles: style="position:absolute; left:xpx; top:ypx; width:widthpx; height:heightpx; ..."
   - FORBIDDEN: Do NOT use margin for text positioning - not in inline styles, not in CSS classes.
   - Apply typography: fontFamily, fontSize, fontWeight, letterSpacing, lineHeightPx, color, textAlignHorizontal.

7. COLORS & STYLES:
   - Use hex values if provided (hex, backgroundColorHex) - prefer these over RGB conversion.
   - Gradients: linear-gradient(90deg, color1 position%, color2 position%) where position is 0-1 converted to percentage.
   - Use backgroundColorHex for FRAME backgrounds when available.

8. NODE HIERARCHY (CRITICAL):
   - TEXT inside input FRAME → ONLY used for input value/placeholder, never rendered as separate element.
   - TEXT inside button FRAME → ONLY rendered inside <button>, never as duplicate outside.
   - TEXT as direct child of root/container → rendered as standalone text element.
   - Once a FRAME/TEXT is mapped to an HTML element, do NOT create duplicate elements.

9. COORDINATE PRECISION:
   - Use EXACT coordinates from JSON - never use transform, calc(), or relative positioning for child elements.
   - Example: If rectangle is at x:127, y:839 → use left:127px; top:839px; NOT left:50%; transform:translateX(-50%); bottom:20px;
   - All positioning must be absolute with exact pixel values from JSON.

10. CSS STYLESHEET RULES:
    - You may use a <style> tag ONLY for:
      * Body flex centering and background
      * Font imports (Google Fonts)
      * Input placeholder styling (::placeholder)
      * Basic resets (margin:0, padding:0 on body/html)
    - FORBIDDEN: Do NOT define CSS classes with margin, padding, position, left, top, width, height, or any positioning properties.
    - FORBIDDEN: Do NOT use CSS classes for positioning - all positioning must be inline styles.
    - All element positioning, sizing, colors, borders, etc. should be in inline styles on the elements themselves.

OUTPUT: Complete HTML document only (<!DOCTYPE html>…</html>). No markdown, no explanations, no extra text.
  `;
};

export const getPromptFinal = () => {
  return `
### Role: 
Expert frontend engineer specializing in pixel-perfect Figma get-file api response conversion to Html/Css file. 

### Steps to Follow (MANDATORY ORDER):

1. Parse the JSON: Extract pages[0].children[0] as the root FRAME.
   - Root FRAME: Always use position: relative (never absolute)

2. Create HTML structure: Build <!DOCTYPE html> with <head> and <body>

3. Add fonts: Import required font families from Google Fonts in <head>

4. Create root container: Use root FRAME dimensions (width, height), background color, and border-radius

5. Process children: For each child node, calculate relative positions (child.x - parent.x, child.y - parent.y)

6. Apply styling: Use inline styles for positioning (position:absolute with exact x,y), put other styles in <style> tag

7. Match exactly: Colors (hex), fonts, spacing, border-radius, gradients from JSON

8. As per class name try to create similar html elements for better accessibility and maintainability.
   *** Match exact styles as per given to the frame in figma json response (height, width, border-radius, padding, margin, etc.) 
   and map html elements as per class name.***
   eg - class:input-email -> <input type="email" value="andy@gmail.com">
   eg - class:input-password -> <input type="password" placeholder="Password">
   eg - class:sign-in-button -> <button type="submit">Sign in</button>
   eg - class:create-account-button -> <button type="submit">Create account</button>
   eg - class:forgot-password -> <a href="#">Forgot password</a>
   eg - class:home-indicator -> <div class="home-indicator"></div>
   eg - class:headline -> <h1>Sign in</h1>
   eg - class:input-container -> <div class="input-container"></div>

9. Do not alter styles as per html elements, style them as per figma response.

10. Do not add extra elements as per the frame, just map html elements as per class name.

11. When textAlignHorizontal: "CENTER", element MUST have width set from JSON.

12. When parent FRAME has layoutMode: "VERTICAL" with multiple input children:
    * Parent container: position: absolute; display: flex; flex-direction: column.

13. Border-radius: cornerRadii [a,b,c,d] → border-radius: a b c d; cornerRadius (single) → border-radius: value; [a,b,c,d] order: top-left, top-right, bottom-right, bottom-left.
   * Examples: cornerRadii [8,8,0,0] → border-radius: 8px 8px 0 0; cornerRadii [0,0,8,8] → border-radius: 0 0 8px 8px; cornerRadius: 32 → border-radius: 32px.

### CRITICAL RULE:
- Follow exact step mentioned in the prompt and do not alter them.
- Do not add extra label, span, div, p, etc. as per the frame, just map html elements as per figma response structure.
- Do not add extra border, padding, margin.
- Do not add extra styles or alter any styles or positioning of the elements.
  `;
};

export const getPromptFinal2 = () => {
  return `
Role: 
Expert frontend engineer specializing in pixel-perfect Figma get-file api response conversion to Html/Css file. 

CRITICAL: Follow these steps EXACTLY in order. Do NOT deviate or add variations.

Steps to Follow (MANDATORY ORDER):

1. Parse the JSON: Extract pages[0].children[0] as the root FRAME.
   - Root FRAME: ALWAYS use position: relative (NEVER absolute)

2. Create HTML structure: Build <!DOCTYPE html> with <head> and <body>
   - Set title from JSON fileName property
   - Import fonts from fontFamily values in TEXT nodes

3. Create root container: Use root FRAME dimensions (width, height), backgroundColorHex, cornerRadius
   - position: relative; width: [exact]px; height: [exact]px; background-color: [hex]; border-radius: [value]px;

4. Process children in EXACT order from JSON children array:
   - For each child: Calculate relative positions: left: (child.x - parent.x)px; top: (child.y - parent.y)px;
   - Use EXACT width and height from JSON (never auto or 100% unless specified)

5. Element Conversion (STRICT RULES - NO EXCEPTIONS):
   - FRAME with strokes array + TEXT child → <input> element ONLY
     * Apply FRAME padding directly to <input>: padding: paddingTop paddingRight paddingBottom paddingLeft;
     * Use TEXT.characters as value (dark color) or placeholder (light color)
     * Type: "email" if contains "@", "password" if contains "password", else "text"
     * FORBIDDEN: NO <label>, NO <span>, NO wrapper <div> - TEXT goes directly in input value/placeholder
   - FRAME with fills (gradient/solid) + TEXT child + action words → <button> element ONLY
     * TEXT.characters goes directly inside <button> (NO nested divs)
   - TEXT node (standalone) → semantic HTML (h1/h2/h3/p/span based on fontSize)

6. Styling (EXACT MAPPING - NO APPROXIMATIONS):
   - Colors: Use hex values ONLY (backgroundColorHex, fills[].hex, strokes[].hex)
   - Typography: fontSize, fontFamily, fontWeight, letterSpacing, lineHeightPx from TEXT nodes
   - Borders: strokeWeight → border-width; strokes[].hex → border-color
   - Border-radius: cornerRadii [a,b,c,d] → border-radius: a b c d (top-left, top-right, bottom-right, bottom-left)
     Examples: [8,8,0,0] → 8px 8px 0 0; [0,0,8,8] → 0 0 8px 8px; cornerRadius: 32 → 32px
   - Gradients: GRADIENT_LINEAR → linear-gradient(90deg, #hex1 pos1%, #hex2 pos2%) where pos = position*100
   - Padding: paddingLeft/Right/Top/Bottom → padding: top right bottom left

7. Grouped Input Fields (STRICT):
   - Parent FRAME with layoutMode: "VERTICAL" + multiple child FRAMEs with strokes:
     * Parent: position: absolute; display: flex; flex-direction: column; NO gap (omit gap property)
     * Top input: border-radius from cornerRadii [a,b,0,0] → a b 0 0
     * Bottom input: border-radius from cornerRadii [0,0,c,d] → 0 0 c d; border-top: none;
     * Stack directly: NO gap, NO margin, NO spacing between inputs

8. Positioning (EXACT COORDINATES):
   - Root: position: relative
   - All children: position: absolute; left: [exact x]px; top: [exact y]px;
   - Nested: Calculate relative (child.x - parent.x, child.y - parent.y)
   - Centered text: If textAlignHorizontal: "CENTER", MUST have width from JSON

9. Output Format (MANDATORY):
   - All CSS in <style> tag in <head>
   - Inline styles ONLY for position:absolute with exact x,y
   - Return ONLY HTML document, NO markdown, NO explanations
   - Start with <!DOCTYPE html>, end with </html>

VALIDATION CHECKLIST (MUST PASS):
✓ Root container: position: relative
✓ All children: position: absolute with exact coordinates
✓ Inputs: <input> elements with padding from FRAME, NO wrapper divs/labels
✓ Buttons: <button> with text directly inside, NO nested divs
✓ Grouped inputs: NO gap, border-top: none on bottom
✓ Colors: hex values only
✓ Typography: All properties from JSON (fontSize, letterSpacing, lineHeightPx)
✓ Border-radius: Exact mapping from cornerRadii array
  `;
};

export const getPromptFinalDesignSystem = () => {
  return `
# Figma JSON to HTML Conversion Prompt

## Instructions

Convert the provided Figma JSON export into a pixel-perfect, semantic HTML file. Follow these guidelines:

### 1. Document Structure
- Create a complete HTML5 document with proper DOCTYPE, head, and body tags
- Include meta charset and viewport tags
- Set the page title from the fileName property in the JSON

### 2. Font Handling
- Identify all unique font families used in text nodes
- Import required fonts from Google Fonts (or CDN) in the head section
- Include all necessary font weights used in the design

### 3. Semantic HTML Elements - PRIORITY RULES
Choose appropriate HTML elements based on the component's purpose and name. **Always prefer semantic HTML over div elements.**

#### CRITICAL CONVERSIONS (Must Follow):

**Form Elements** (Highest Priority)
- Frames representing input fields → **MUST use <input>**, NEVER <div> or <label>
- Identify by: names containing "input", "field", "email", "password" OR placeholder-like text content
- Frames representing buttons → **MUST use <button>**, NEVER <div>
- Identify by: names containing "button", "btn", OR action words like "Sign in", "Submit"
- Form containers → use <form> if multiple inputs are grouped

**Example Recognition:**
- "Frame 1321318734" with text "andy@gmail.com" → <input type="email" value="andy@gmail.com">
- "Frame 1321318735" with text "Password" → <input type="password" placeholder="Password">
- "Frame" with text "Sign in" and gradient background → <button type="submit">Sign in</button>

#### Text Elements
- For large headlines (fontSize > 32px) → use <h1>
- For subheadings (fontSize 24-32px) → use <h2>
- For smaller headings (fontSize 18-24px) → use <h3>
- For body text with names containing "paragraph", "description", "body" → use <p>
- For links (names containing "link", "anchor") → use <a>
- For generic text → use <span>

#### Interactive Elements
- For button frames (names containing "button", "btn", "cta") → use <button>
- For clickable cards or items → use <a> or <button> based on context
- For navigation items → use <nav> with <ul>/<li>

#### Structural Elements
- For main content areas → use <main>
- For headers → use <header>
- For footers → use <footer>
- For navigation → use <nav>
- For sections → use <section>
- For generic containers → use <div>

#### List Elements
- For frames containing repeated similar items → use <ul> or <ol> with <li>

### 4. Layout & Positioning
- Use the canvasBackground color for the body background
- Center the main frame on the page using flexbox
- Apply position: relative to parent containers and position: absolute to children when needed
- Calculate positions exactly as specified: use x, y, width, and height values directly
- Prefer modern CSS (flexbox, grid) over absolute positioning when the layout structure allows it

### 5. Styling Rules

#### Colors
- Convert RGBA values to hex using the provided hex properties
- For opacity, use rgba() format or apply the opacity CSS property
- Apply colors to:
  - fills → background-color or background-image for gradients
  - strokes → border-color
  - Text fills → color

#### Gradients
- For GRADIENT_LINEAR type fills:
  - Use CSS linear-gradient()
  - Convert gradient stops with their colors and positions
  - Format: linear-gradient(90deg, color1 position1%, color2 position2%)

#### Borders & Strokes
- Apply strokeWeight as border-width
- Use strokeAlign to determine border box model (default to border-box)
- Handle cornerRadius values:
  - Single value → border-radius: Xpx
  - Array (cornerRadii) → border-top-left-radius, border-top-right-radius, etc.

#### Effects
- For BACKGROUND_BLUR: apply backdrop-filter: blur(Xpx)
- For DROP_SHADOW: apply box-shadow with appropriate values

#### Layout Modes
- For layoutMode: "VERTICAL" or "HORIZONTAL":
  - Apply display: flex
  - Set flex-direction: column for vertical, row for horizontal
  - Map itemSpacing → gap
  - Map paddingLeft/Right/Top/Bottom → CSS padding
  - Map counterAxisAlignItems → align-items
  - Map primaryAxisAlignItems → justify-content

#### Text Properties
- Apply all text styling:
  - fontSize → font-size
  - fontFamily → font-family
  - fontWeight → font-weight
  - letterSpacing → letter-spacing
  - lineHeightPx → line-height
  - textAlignHorizontal → text-align
  - textAlignVertical → use flexbox alignment

#### Clipping
- For clipsContent: true → apply overflow: hidden
- For clipsContent: false → apply overflow: visible if needed

### 6. Accessibility Guidelines
- Add appropriate ARIA labels where needed
- Ensure form inputs have associated labels
- Add alt text for images (if present)
- Use semantic HTML to improve screen reader experience
- Ensure proper heading hierarchy
- Add placeholder text for input fields based on the text content in the design

### 7. Input Field Handling - CRITICAL
When you encounter frames that represent input fields:
- **MUST** convert to actual <input> or <textarea> elements, NOT <div> or <label>
- Set the type attribute appropriately (text, email, password, etc.)
- Identify input fields by:
  - Frame names containing: "input", "field", "text-field", "email", "password", "search"
  - Text content that suggests placeholder text: "Email", "Password", "Username", "Search"
  - Parent frames with names like "Form", "Login", "Sign in", "Sign up"
- If the text content looks like placeholder text (e.g., "Email", "Password") → use as placeholder attribute
- If the text content looks like actual data (e.g., "andy@gmail.com") → use as value attribute
- Example transformation:
  \`\`\`html
  <!-- WRONG -->
  <div class="input"><label>Password</label></div>
  
  <!-- CORRECT -->
  <input type="password" placeholder="Password" class="input">
  \`\`\`
- Apply all styling directly to the <input> element to maintain visual appearance
- Use box-sizing: border-box for inputs to handle padding correctly

### 8. Button Handling - CRITICAL
When you encounter frames that represent buttons:
- **MUST** convert to <button> elements, NOT <div> with nested <div>
- Identify buttons by:
  - Frame names containing: "button", "btn", "cta", "submit", "action"
  - Visual indicators: rounded corners (high border-radius), solid background colors
  - Text content suggesting actions: "Sign in", "Login", "Submit", "Create", "Continue"
- Use the text content from child TEXT nodes directly inside the <button>
- Example transformation:
  \`\`\`html
  <!-- WRONG -->
  <div class="button"><div class="button-text">Sign in</div></div>
  
  <!-- CORRECT -->
  <button type="submit" class="button">Sign in</button>
  \`\`\`
- Apply all visual styling (gradients, colors, borders, etc.) directly to the <button>
- Add appropriate type attribute (submit, button, reset)
- Remove default button styling with: border: none; background: none; cursor: pointer;

### 9. Code Quality
- Write clean, readable HTML with proper indentation
- Use CSS classes in a <style> block rather than inline styles
- Create reusable classes for common patterns
- Add comments referencing the Figma node IDs for debugging
- Ensure proper nesting and semantic structure

### 10. Output Requirements
- The final HTML should render identically to the Figma design
- All measurements should be in pixels as specified
- Colors should match exactly
- Fonts should load correctly
- The design should be centered on the page with the canvas background visible
- Use semantic HTML elements for better accessibility and maintainability
- Maintain pixel-perfect accuracy while using appropriate HTML elements

## Processing Steps

1. Parse the JSON structure
2. Extract canvas background and page properties
3. Identify the root frame(s) in pages[0].children
4. **CRITICAL: Analyze each node to determine if it's an input field or button FIRST**
   - Check frame names and text content for keywords
   - Look for visual patterns (rounded rectangles with text = buttons)
   - Look for text-like patterns (bordered rectangles with single text = inputs)
5. **Convert input-like frames to <input> elements with proper type and attributes**
6. **Convert button-like frames to <button> elements with text content directly inside**
7. Recursively process remaining nodes with appropriate semantic elements
8. Generate semantic HTML structure (NO unnecessary nested divs)
9. Create CSS classes for styling instead of inline styles
10. Apply all styling properties via CSS, ensuring visual accuracy
11. Ensure proper nesting and positioning
12. Validate that all visual properties are preserved
13. Add accessibility attributes where appropriate

## Common Mistakes to Avoid
❌ WRONG: <div class="input"><label>Password</label></div>
✅ CORRECT: <input type="password" placeholder="Password" class="input">

❌ WRONG: <div class="button"><div class="button-text">Sign in</div></div>
✅ CORRECT: <button type="submit" class="button">Sign in</button>

❌ WRONG: Using <label> as a text display element
✅ CORRECT: Use <label> only when associated with an input using "for" attribute

❌ WRONG: Nesting divs inside buttons
✅ CORRECT: Button text goes directly inside <button> element
  `;
};
