export function minimizeFigmaNode(node: any): any {
  if (!node) return null;

  const minimal: any = {
    type: node.type,
    name: node.name,
  };

  // Position & Size (essential)
  if (node.absoluteBoundingBox) {
    minimal.x = Math.round(node.absoluteBoundingBox.x);
    minimal.y = Math.round(node.absoluteBoundingBox.y);
    minimal.width = Math.round(node.absoluteBoundingBox.width);
    minimal.height = Math.round(node.absoluteBoundingBox.height);
  }

  // Fills (background colors/gradients)
  if (node.fills?.length > 0) {
    minimal.fills = node.fills
      .map((fill: any) => {
        if (fill.type === "SOLID") {
          return {
            type: "SOLID",
            color: fill.color,
            opacity: fill.opacity,
          };
        }
        if (fill.type === "GRADIENT_LINEAR") {
          return {
            type: "GRADIENT_LINEAR",
            gradientStops: fill.gradientStops,
          };
        }
        return null;
      })
      .filter(Boolean);
  }

  // Strokes (borders)
  if (node.strokes?.length > 0) {
    minimal.strokes = node.strokes.map((s: any) => ({
      color: s.color,
    }));
    minimal.strokeWeight = node.strokeWeight;
  }

  // Border radius
  if (node.cornerRadius) minimal.cornerRadius = node.cornerRadius;
  if (node.rectangleCornerRadii)
    minimal.cornerRadii = node.rectangleCornerRadii;

  // Text content
  if (node.characters) minimal.text = node.characters;

  // Text styling (simplified)
  if (node.style && node.type === "TEXT") {
    minimal.style = {
      fontFamily: node.style.fontFamily,
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      textAlign: node.style.textAlignHorizontal,
      lineHeight: node.style.lineHeightPx,
      letterSpacing: node.style.letterSpacing,
    };
  }

  // Layout (flexbox)
  if (node.layoutMode) {
    minimal.layout = node.layoutMode; // VERTICAL or HORIZONTAL
    if (node.paddingLeft) minimal.paddingLeft = node.paddingLeft;
    if (node.paddingRight) minimal.paddingRight = node.paddingRight;
    if (node.paddingTop) minimal.paddingTop = node.paddingTop;
    if (node.paddingBottom) minimal.paddingBottom = node.paddingBottom;
    if (node.itemSpacing) minimal.gap = node.itemSpacing;
  }

  // Recursively process children
  if (node.children?.length > 0) {
    minimal.children = node.children.map(minimizeFigmaNode).filter(Boolean);
  }

  return minimal;
}

// Usage
function minimizeFigmaResponse(response: any): any {
  const doc = response.file?.document || response.document;
  return {
    name: response.file?.name || response.name,
    document: minimizeFigmaNode(doc),
  };
}
