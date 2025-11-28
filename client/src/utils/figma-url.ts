/**
 * Extracts the file key from a Figma file URL
 * Supports formats:
 * - https://www.figma.com/file/FILE_KEY/...
 * - https://www.figma.com/design/FILE_KEY/...
 * - https://figma.com/file/FILE_KEY/...
 */
export const extractFileKeyFromUrl = (url: string): string | null => {
  try {
    // Remove any trailing slashes and whitespace
    const cleanUrl = url.trim().replace(/\/$/, "");

    // Match patterns like:
    // - /file/FILE_KEY/
    // - /design/FILE_KEY/
    // - /file/FILE_KEY (end of string)
    const match = cleanUrl.match(/\/(?:file|design)\/([a-zA-Z0-9]+)/);

    if (match && match[1]) {
      return match[1];
    }

    return null;
  } catch (error) {
    console.error("Error extracting file key:", error);
    return null;
  }
};

/**
 * Validates if a URL is a valid Figma file URL
 */
export const isValidFigmaUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      (urlObj.hostname === "www.figma.com" ||
        urlObj.hostname === "figma.com") &&
      (urlObj.pathname.includes("/file/") ||
        urlObj.pathname.includes("/design/"))
    );
  } catch {
    return false;
  }
};
