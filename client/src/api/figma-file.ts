import { get } from "../utils/request";

export interface GetFileOptions {
  version?: string;
  ids?: string;
  depth?: number;
  geometry?: string;
  plugin_data?: string;
  branch_data?: boolean;
}

// Figma node/document structure (simplified - can be expanded as needed)
export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  [key: string]: unknown; // Allow additional properties
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
  componentSetId?: string;
  documentationLinks?: Array<{ uri: string }>;
  [key: string]: unknown;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: string;
  description?: string;
  [key: string]: unknown;
}

export interface FigmaFileResponse {
  success: boolean;
  file: {
    document: FigmaNode;
    components: Record<string, FigmaComponent>;
    styles: Record<string, FigmaStyle>;
    name: string;
    lastModified: string;
    thumbnailUrl: string;
    version: string;
    role: string;
    editorType: string;
    linkAccess: string;
  };
}

export const getFigmaFile = async (
  fileKey: string,
  options?: GetFileOptions
): Promise<FigmaFileResponse> => {
  const params: Record<string, string> = {};

  if (options?.version) params.version = options.version;
  if (options?.ids) params.ids = options.ids;
  if (options?.depth) params.depth = options.depth.toString();
  if (options?.geometry) params.geometry = options.geometry;
  if (options?.plugin_data) params.plugin_data = options.plugin_data;
  if (options?.branch_data !== undefined) {
    params.branch_data = options.branch_data.toString();
  }

  return get<FigmaFileResponse>(`/file/figma/${fileKey}`, params);
};

export interface ConvertToHTMLResponse {
  success: boolean;
  html: string;
  fileName: string;
}

export const convertFigmaFileToHTML = async (
  fileKey: string
): Promise<ConvertToHTMLResponse> => {
  return get<ConvertToHTMLResponse>(`/file/figma/${fileKey}/convert`);
};
