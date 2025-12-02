import fs from "fs";
import path from "path";

export class JsonStorageService {
  private readonly jsonDir: string;
  private readonly minimizedDir: string;

  constructor() {
    // Create output/json directory
    this.jsonDir = path.join(process.cwd(), "output", "json");
    // Create output/minimized directory
    this.minimizedDir = path.join(process.cwd(), "output", "minimized");

    // Ensure directories exist
    if (!fs.existsSync(this.jsonDir)) {
      fs.mkdirSync(this.jsonDir, { recursive: true });
      console.log(`Created JSON directory: ${this.jsonDir}`);
    }

    if (!fs.existsSync(this.minimizedDir)) {
      fs.mkdirSync(this.minimizedDir, { recursive: true });
      console.log(`Created minimized directory: ${this.minimizedDir}`);
    }
  }

  /**
   * Save complete Figma file JSON response
   * @param data - Complete Figma file data
   * @param fileKey - Figma file key (used as filename)
   * @returns Filename of the saved file (e.g., "abc123.json")
   */
  saveCompleteJSON(data: any, fileKey: string): string {
    const fileName = `${fileKey}.json`;
    const filePath = path.join(this.jsonDir, fileName);

    // Write file
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");

    console.log(`Complete JSON saved to: ${filePath}`);
    return fileName; // Return only filename
  }

  /**
   * Save minimized/extracted Figma JSON
   * @param extractedData - Extracted/minimized data from FigmaExtractorService
   * @param fileKey - Figma file key (used as filename)
   * @returns Filename of the saved file (e.g., "abc123.json")
   */
  saveMinimizedJSON(extractedData: any, fileKey: string): string {
    const fileName = `${fileKey}.json`;
    const filePath = path.join(this.minimizedDir, fileName);

    // Write file
    fs.writeFileSync(filePath, JSON.stringify(extractedData, null, 2), "utf-8");

    console.log(`Minimized JSON saved to: ${filePath}`);
    return fileName; // Return only filename
  }

  /**
   * Read complete JSON file by fileKey
   * @param fileKey - Figma file key
   * @returns Parsed JSON data
   */
  readCompleteJSON(fileKey: string): any {
    const fileName = `${fileKey}.json`;
    const filePath = path.join(this.jsonDir, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Complete JSON file not found: ${fileName}`);
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  }

  /**
   * Read minimized JSON file by fileKey
   * @param fileKey - Figma file key
   * @returns Parsed JSON data
   */
  readMinimizedJSON(fileKey: string): any {
    const fileName = `${fileKey}.json`;
    const filePath = path.join(this.minimizedDir, fileName);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Minimized JSON file not found: ${fileName}`);
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(fileContent);
  }

  /**
   * Check if complete JSON exists for a fileKey
   */
  completeJSONExists(fileKey: string): boolean {
    const fileName = `${fileKey}.json`;
    const filePath = path.join(this.jsonDir, fileName);
    return fs.existsSync(filePath);
  }

  /**
   * Check if minimized JSON exists for a fileKey
   */
  minimizedJSONExists(fileKey: string): boolean {
    const fileName = `${fileKey}.json`;
    const filePath = path.join(this.minimizedDir, fileName);
    return fs.existsSync(filePath);
  }
}
