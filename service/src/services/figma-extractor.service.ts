/**
 * Extracts only essential data from Figma file response
 * Based on official Figma node types: https://developers.figma.com/docs/rest-api/file-node-types/
 * to minimize token usage when sending to LLM
 */

interface GradientStop {
  color: { r: number; g: number; b: number; a: number };
  position: number;
  hex?: string; // Pre-converted hex color
}

interface ExtractedNode {
  id: string;
  type: string;
  name: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  children?: ExtractedNode[];

  // Text content (TEXT nodes)
  characters?: string;

  // Colors - support both solid and gradient (all visual nodes)
  fills?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
    hex?: string; // Pre-converted hex color
    opacity?: number;
    gradientStops?: GradientStop[];
    gradientType?: string;
  }>;
  backgroundColor?: { r: number; g: number; b: number; a: number };
  backgroundColorHex?: string; // Pre-converted hex color

  // Layout (FRAME nodes with auto-layout)
  layoutMode?: string; // "HORIZONTAL" | "VERTICAL"
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  counterAxisAlignItems?: string; // "MIN" | "CENTER" | "MAX" | "STRETCH"
  primaryAxisSizingMode?: string; // "FIXED" | "AUTO"

  // Constraints (responsive behavior)
  constraints?: {
    vertical: string; // "TOP" | "BOTTOM" | "CENTER" | "STRETCH"
    horizontal: string; // "LEFT" | "RIGHT" | "CENTER" | "STRETCH"
  };

  // Typography (TEXT nodes)
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: number;
  textAlignHorizontal?: string;
  letterSpacing?: number;
  lineHeightPx?: number;

  // Border (all visual nodes)
  strokes?: Array<{
    type: string;
    color?: { r: number; g: number; b: number; a: number };
    hex?: string; // Pre-converted hex color
  }>;
  strokeWeight?: number;
  strokeAlign?: string; // "CENTER" | "INSIDE" | "OUTSIDE"

  // Corners (RECTANGLE, FRAME nodes)
  cornerRadius?: number;
  cornerRadii?: [number, number, number, number]; // [topLeft, topRight, bottomRight, bottomLeft]

  // Clipping (FRAME nodes)
  clipsContent?: boolean;

  // Opacity (all nodes)
  opacity?: number;

  // Layout (FRAME nodes with auto-layout) - ADD THESE:
  layoutSizingHorizontal?: string; // "HUG" | "FILL" | "FIXED"
  layoutSizingVertical?: string; // "HUG" | "FILL" | "FIXED"
  layoutAlign?: string; // "INHERIT" | "STRETCH" | etc.
  layoutGrow?: number; // 0 or 1
  layoutWrap?: string; // "NO_WRAP" | "WRAP"
  primaryAxisAlignItems?: string; // "CENTER" | "MIN" | "MAX" | etc.
  counterAxisSizingMode?: string; // "FIXED" | "AUTO"

  // Typography (TEXT nodes) - ADD THESE:
  textAlignVertical?: string; // "CENTER" | "TOP" | "BOTTOM"
  textAutoResize?: string; // "WIDTH_AND_HEIGHT" | etc.

  // Effects - ADD THIS:
  effects?: Array<{
    type: string; // "BACKGROUND_BLUR" | "DROP_SHADOW" | etc.
    visible?: boolean;
    radius?: number; // For blur
    color?: { r: number; g: number; b: number; a: number };
    offset?: { x: number; y: number }; // For shadows
    spread?: number; // For shadows
  }>;

  // Transform - ADD THIS:
  rotation?: number; // Rotation in degrees
}

export class FigmaExtractorService {
  /**
   * Node types to skip (non-visual or complex operations)
   */
  private readonly SKIP_NODE_TYPES = [
    "VECTOR",
    "BOOLEAN_OPERATION",
    "STAR",
    "POLYGON",
    "ELLIPSE",
    "REGULAR_POLYGON",
    "SLICE",
    "CONNECTOR",
    "WASHI_TAPE",
  ];

  /**
   * Convert RGB (0-1 range) to hex color string
   */
  private rgbToHex(r: number, g: number, b: number): string {
    const rInt = Math.round(r * 255);
    const gInt = Math.round(g * 255);
    const bInt = Math.round(b * 255);
    return `#${rInt.toString(16).padStart(2, "0")}${gInt
      .toString(16)
      .padStart(2, "0")}${bInt.toString(16).padStart(2, "0")}`.toUpperCase();
  }

  /**
   * Recursively extract essential data from a Figma node
   * Based on node type properties from Figma API docs
   */
  private extractNode(
    node: any,
    maxDepth: number = 10,
    currentDepth: number = 0
  ): ExtractedNode | null {
    if (!node || typeof node !== "object") {
      return null;
    }

    if (currentDepth > maxDepth) return null;

    // Skip non-visual node types
    if (this.SKIP_NODE_TYPES.includes(node.type)) {
      return null;
    }

    const extracted: ExtractedNode = {
      id: node.id,
      type: node.type,
      name: node.name,
    };

    // Extract position and size - try multiple sources
    if (node.absoluteBoundingBox) {
      extracted.x = Math.round(node.absoluteBoundingBox.x);
      extracted.y = Math.round(node.absoluteBoundingBox.y);
      extracted.width = Math.round(node.absoluteBoundingBox.width);
      extracted.height = Math.round(node.absoluteBoundingBox.height);
    } else if (node.absoluteRenderBounds) {
      // Fallback to absoluteRenderBounds if available
      extracted.x = Math.round(node.absoluteRenderBounds.x);
      extracted.y = Math.round(node.absoluteRenderBounds.y);
      extracted.width = Math.round(node.absoluteRenderBounds.width);
      extracted.height = Math.round(node.absoluteRenderBounds.height);
    } else if (node.x !== undefined && node.y !== undefined) {
      // Use direct x, y, width, height if available
      extracted.x = Math.round(node.x);
      extracted.y = Math.round(node.y);
      if (node.width !== undefined) extracted.width = Math.round(node.width);
      if (node.height !== undefined) extracted.height = Math.round(node.height);
    }
    // Note: We still return the node even without position/size
    // as it might be a container or have other important properties

    // Extract text content (TEXT nodes)
    if (node.characters) {
      extracted.characters = node.characters;
    }

    // Extract fills (colors and gradients) - check both fills and background array
    const allFills = [...(node.fills || []), ...(node.background || [])].filter(
      (fill: any) =>
        fill &&
        fill.visible !== false && // Only visible fills
        (fill.type === "SOLID" ||
          fill.type === "GRADIENT_LINEAR" ||
          fill.type === "GRADIENT_RADIAL")
    );

    if (allFills.length > 0) {
      extracted.fills = allFills
        .map((fill: any) => {
          if (fill.type === "SOLID" && fill.color) {
            return {
              type: fill.type,
              color: fill.color,
              opacity: fill.opacity,
              hex: this.rgbToHex(fill.color.r, fill.color.g, fill.color.b),
            };
          } else if (
            (fill.type === "GRADIENT_LINEAR" ||
              fill.type === "GRADIENT_RADIAL") &&
            fill.gradientStops
          ) {
            return {
              type: fill.type,
              gradientType:
                fill.type === "GRADIENT_LINEAR" ? "LINEAR" : "RADIAL",
              gradientStops: fill.gradientStops.map((stop: any) => ({
                color: stop.color,
                hex: this.rgbToHex(stop.color.r, stop.color.g, stop.color.b),
                position: stop.position,
              })),
            };
          }
          return null;
        })
        .filter((fill: any): fill is NonNullable<typeof fill> => fill !== null)
        .slice(0, 1); // Only take first fill to save tokens
    }

    // Extract background color (separate from fills, used by FRAME nodes)
    if (
      node.backgroundColor &&
      (node.backgroundColor.a > 0 || // Has opacity
        node.backgroundColor.r !== 0 ||
        node.backgroundColor.g !== 0 ||
        node.backgroundColor.b !== 0)
    ) {
      extracted.backgroundColor = node.backgroundColor;
      extracted.backgroundColorHex = this.rgbToHex(
        node.backgroundColor.r,
        node.backgroundColor.g,
        node.backgroundColor.b
      );
    }

    // Extract layout properties (FRAME nodes with auto-layout)
    if (node.layoutMode) {
      extracted.layoutMode = node.layoutMode;
      if (node.paddingLeft !== undefined)
        extracted.paddingLeft = node.paddingLeft;
      if (node.paddingRight !== undefined)
        extracted.paddingRight = node.paddingRight;
      if (node.paddingTop !== undefined) extracted.paddingTop = node.paddingTop;
      if (node.paddingBottom !== undefined)
        extracted.paddingBottom = node.paddingBottom;
      if (node.itemSpacing !== undefined)
        extracted.itemSpacing = node.itemSpacing;
      if (node.counterAxisAlignItems)
        extracted.counterAxisAlignItems = node.counterAxisAlignItems;
      if (node.primaryAxisSizingMode)
        extracted.primaryAxisSizingMode = node.primaryAxisSizingMode;
    }

    // Extract additional layout properties
    if (node.layoutSizingHorizontal)
      extracted.layoutSizingHorizontal = node.layoutSizingHorizontal;
    if (node.layoutSizingVertical)
      extracted.layoutSizingVertical = node.layoutSizingVertical;
    if (node.layoutAlign) extracted.layoutAlign = node.layoutAlign;
    if (node.layoutGrow !== undefined) extracted.layoutGrow = node.layoutGrow;
    if (node.layoutWrap) extracted.layoutWrap = node.layoutWrap;
    if (node.primaryAxisAlignItems)
      extracted.primaryAxisAlignItems = node.primaryAxisAlignItems;
    if (node.counterAxisSizingMode)
      extracted.counterAxisSizingMode = node.counterAxisSizingMode;

    // Extract typography (TEXT nodes)
    if (node.style) {
      if (node.style.fontSize) extracted.fontSize = node.style.fontSize;
      if (node.style.fontFamily) extracted.fontFamily = node.style.fontFamily;
      if (node.style.fontWeight) extracted.fontWeight = node.style.fontWeight;
      if (node.style.textAlignHorizontal)
        extracted.textAlignHorizontal = node.style.textAlignHorizontal;
      if (node.style.textAlignVertical)
        extracted.textAlignVertical = node.style.textAlignVertical;
      if (node.style.letterSpacing !== undefined)
        extracted.letterSpacing = node.style.letterSpacing;
      if (node.style.lineHeightPx)
        extracted.lineHeightPx = node.style.lineHeightPx;
      if (node.style.textAutoResize)
        extracted.textAutoResize = node.style.textAutoResize;
    }

    // Extract border/strokes (all visual nodes)
    if (
      node.strokes &&
      Array.isArray(node.strokes) &&
      node.strokes.length > 0
    ) {
      const visibleStrokes = node.strokes.filter(
        (stroke: any) =>
          stroke.type === "SOLID" && stroke.color && stroke.visible !== false
      );
      if (visibleStrokes.length > 0) {
        extracted.strokes = visibleStrokes
          .map((stroke: any) => ({
            type: stroke.type,
            color: stroke.color,
            hex: this.rgbToHex(stroke.color.r, stroke.color.g, stroke.color.b),
          }))
          .slice(0, 1);
        if (node.strokeWeight !== undefined)
          extracted.strokeWeight = node.strokeWeight;
        if (node.strokeAlign) extracted.strokeAlign = node.strokeAlign;
      }
    }

    // Extract effects (shadows, blurs)
    if (
      node.effects &&
      Array.isArray(node.effects) &&
      node.effects.length > 0
    ) {
      extracted.effects = node.effects
        .filter((effect: any) => effect.visible !== false)
        .map((effect: any) => ({
          type: effect.type,
          visible: effect.visible,
          radius: effect.radius,
          color: effect.color,
          offset: effect.offset,
          spread: effect.spread,
        }))
        .slice(0, 3); // Limit to 3 effects to save tokens
    }

    // Extract corner radius (RECTANGLE, FRAME nodes)
    if (node.rectangleCornerRadii && Array.isArray(node.rectangleCornerRadii)) {
      // [topLeft, topRight, bottomRight, bottomLeft]
      const [tl, tr, br, bl] = node.rectangleCornerRadii as [
        number,
        number,
        number,
        number
      ];
      extracted.cornerRadii = [
        Math.round(tl),
        Math.round(tr),
        Math.round(br),
        Math.round(bl),
      ];
    } else if (node.cornerRadius !== undefined) {
      extracted.cornerRadius = Math.round(node.cornerRadius);
    }

    // Extract clipping (FRAME nodes)
    if (node.clipsContent !== undefined) {
      extracted.clipsContent = node.clipsContent;
    }

    // Extract opacity (all nodes)
    if (node.opacity !== undefined && node.opacity !== 1) {
      extracted.opacity = node.opacity;
    }

    // Extract rotation
    if (node.rotation !== undefined && node.rotation !== 0) {
      extracted.rotation = node.rotation;
    }

    // Extract constraints (responsive behavior)
    if (node.constraints) {
      extracted.constraints = {
        vertical: node.constraints.vertical,
        horizontal: node.constraints.horizontal,
      };
    }

    // Recursively extract children - increase depth limit
    if (
      node.children &&
      Array.isArray(node.children) &&
      currentDepth < maxDepth
    ) {
      extracted.children = node.children
        .map((child: any) =>
          this.extractNode(child, maxDepth, currentDepth + 1)
        )
        .filter(
          (child: ExtractedNode | null) => child !== null
        ) as ExtractedNode[];
    }

    // Return node even if it has no children or position
    // Some nodes are important containers even without visual properties
    return extracted;
  }

  /**
   * Extract essential data from Figma file response
   */
  extractEssentialData(figmaFileData: any): {
    fileName: string;
    canvasBackground?: { r: number; g: number; b: number; a: number };
    pages: ExtractedNode[];
    summary: {
      totalPages: number;
      totalFrames: number;
      totalTextNodes: number;
      totalRectangles: number;
    };
  } {
    // Handle both wrapped and unwrapped data structures
    // Support: { file: { document: ... } } or { document: ... } or direct document
    let document: any = {};

    if (figmaFileData.file?.document) {
      // Wrapped in { file: { document: ... } }
      document = figmaFileData.file.document;
    } else if (figmaFileData.document) {
      // Direct { document: ... }
      document = figmaFileData.document;
    } else if (figmaFileData.type === "DOCUMENT") {
      // Already a document node
      document = figmaFileData;
    } else {
      console.warn(
        "No document found in figmaFileData:",
        Object.keys(figmaFileData)
      );
      // Try to find document in the data structure
      document = figmaFileData;
    }

    const pages: ExtractedNode[] = [];

    // Extract pages (CANVAS nodes) - limit to first 3 pages to save tokens
    if (document.children && Array.isArray(document.children)) {
      const pageNodes = document.children.slice(0, 3);

      for (const page of pageNodes) {
        // CANVAS nodes have backgroundColor for the page background
        const canvasBackground = page.backgroundColor;

        const extractedPage = this.extractNode(page, 10); // Increased maxDepth
        if (extractedPage) {
          pages.push(extractedPage);
        } else {
          console.warn(
            `Failed to extract page: ${page.name} (type: ${page.type})`
          );
        }
      }
    } else {
      console.warn("No children found in document:", document);
    }

    // Count summary statistics
    let totalFrames = 0;
    let totalTextNodes = 0;
    let totalRectangles = 0;

    const countNodes = (node: ExtractedNode) => {
      if (
        node.type === "FRAME" ||
        node.type === "COMPONENT" ||
        node.type === "INSTANCE"
      ) {
        totalFrames++;
      }
      if (node.type === "TEXT") {
        totalTextNodes++;
      }
      if (node.type === "RECTANGLE") {
        totalRectangles++;
      }
      if (node.children) {
        node.children.forEach(countNodes);
      }
    };

    pages.forEach(countNodes);

    // Get canvas background from first page (CANVAS node)
    const firstPage = document.children?.[0];
    const canvasBackground = firstPage?.backgroundColor;

    return {
      fileName: figmaFileData.name || "Untitled",
      canvasBackground,
      pages,
      summary: {
        totalPages: pages.length,
        totalFrames,
        totalTextNodes,
        totalRectangles,
      },
    };
  }

  /**
   * Convert extracted data to a compact JSON string
   * Removes null/undefined values to save tokens
   */
  toCompactJSON(data: any): string {
    return JSON.stringify(data, (key, value) => {
      // Remove null, undefined, and empty arrays
      if (value === null || value === undefined) return undefined;
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (typeof value === "object" && Object.keys(value).length === 0)
        return undefined;
      return value;
    });
  }
}
