import fs from "fs";
import path from "path";

export class HtmlStorageService {
  private readonly outputDir: string;

  constructor() {
    // Create output/html directory in service root
    this.outputDir = path.join(process.cwd(), "output", "html");

    // Ensure directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
      console.log(`Created HTML output directory: ${this.outputDir}`);
    }
  }

  /**
   * Save HTML content to a file
   * @param html - HTML content to save
   * @param fileName - Name of the file (without extension)
   * @returns Path to the saved file
   */
  saveHTML(html: string, fileName: string): string {
    // Sanitize filename
    const sanitizedFileName = fileName
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase();

    // Add timestamp to make it unique
    const timestamp = Date.now();
    const filePath = path.join(
      this.outputDir,
      `${sanitizedFileName}_${timestamp}.html`
    );

    // Write file
    fs.writeFileSync(filePath, html, "utf-8");

    console.log(`HTML saved to: ${filePath}`);
    return filePath;
  }

  /**
   * Get the full path to a saved HTML file
   */
  getFilePath(fileName: string): string {
    return path.join(this.outputDir, fileName);
  }

  /**
   * Check if a file exists
   */
  fileExists(fileName: string): boolean {
    const filePath = this.getFilePath(fileName);
    return fs.existsSync(filePath);
  }

  /**
   * Read HTML file content
   */
  readHTML(fileName: string): string {
    const filePath = this.getFilePath(fileName);
    if (!this.fileExists(fileName)) {
      throw new Error(`File not found: ${fileName}`);
    }
    return fs.readFileSync(filePath, "utf-8");
  }

  /**
   * List all saved HTML files
   */
  listFiles(): string[] {
    if (!fs.existsSync(this.outputDir)) {
      return [];
    }
    return fs
      .readdirSync(this.outputDir)
      .filter((file) => file.endsWith(".html"));
  }
}
