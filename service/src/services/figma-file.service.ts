import axios from "axios";
import { figmaConfig } from "../config/figma.config";

export class FigmaFileService {
  async getFile(
    accessToken: string,
    fileKey: string,
    options?: {
      version?: string;
      ids?: string;
      depth?: number;
      geometry?: string;
      plugin_data?: string;
      branch_data?: boolean;
    }
  ): Promise<any> {
    try {
      const params = new URLSearchParams();

      if (options?.version) params.append("version", options.version);
      if (options?.ids) params.append("ids", options.ids);
      if (options?.depth) params.append("depth", options.depth.toString());
      if (options?.geometry) params.append("geometry", options.geometry);
      if (options?.plugin_data)
        params.append("plugin_data", options.plugin_data);
      if (options?.branch_data !== undefined) {
        params.append("branch_data", options.branch_data.toString());
      }

      const queryString = params.toString();
      const url = `${figmaConfig.apiBaseUrl}/files/${fileKey}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get file: ${
            error.response?.data?.error ||
            error.response?.data?.err ||
            error.message
          }`
        );
      }
      throw error;
    }
  }

  async getFileNodes(
    accessToken: string,
    fileKey: string,
    nodeIds: string,
    options?: {
      version?: string;
      depth?: number;
      geometry?: string;
      plugin_data?: string;
    }
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        ids: nodeIds,
      });

      if (options?.version) params.append("version", options.version);
      if (options?.depth) params.append("depth", options.depth.toString());
      if (options?.geometry) params.append("geometry", options.geometry);
      if (options?.plugin_data)
        params.append("plugin_data", options.plugin_data);

      const url = `${
        figmaConfig.apiBaseUrl
      }/files/${fileKey}/nodes?${params.toString()}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get file nodes: ${
            error.response?.data?.error ||
            error.response?.data?.err ||
            error.message
          }`
        );
      }
      throw error;
    }
  }

  async getFileImages(
    accessToken: string,
    fileKey: string,
    nodeIds: string,
    options?: {
      scale?: number;
      format?: "jpg" | "png" | "svg" | "pdf";
      svg_outline_text?: boolean;
      svg_include_id?: boolean;
      svg_include_node_id?: boolean;
      svg_simplify_stroke?: boolean;
      contents_only?: boolean;
      use_absolute_bounds?: boolean;
      version?: string;
    }
  ): Promise<any> {
    try {
      const params = new URLSearchParams({
        ids: nodeIds,
      });

      if (options?.scale) params.append("scale", options.scale.toString());
      if (options?.format) params.append("format", options.format);
      if (options?.svg_outline_text !== undefined) {
        params.append("svg_outline_text", options.svg_outline_text.toString());
      }
      if (options?.svg_include_id !== undefined) {
        params.append("svg_include_id", options.svg_include_id.toString());
      }
      if (options?.svg_include_node_id !== undefined) {
        params.append(
          "svg_include_node_id",
          options.svg_include_node_id.toString()
        );
      }
      if (options?.svg_simplify_stroke !== undefined) {
        params.append(
          "svg_simplify_stroke",
          options.svg_simplify_stroke.toString()
        );
      }
      if (options?.contents_only !== undefined) {
        params.append("contents_only", options.contents_only.toString());
      }
      if (options?.use_absolute_bounds !== undefined) {
        params.append(
          "use_absolute_bounds",
          options.use_absolute_bounds.toString()
        );
      }
      if (options?.version) params.append("version", options.version);

      const url = `${
        figmaConfig.apiBaseUrl
      }/images/${fileKey}?${params.toString()}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get file images: ${
            error.response?.data?.error ||
            error.response?.data?.err ||
            error.message
          }`
        );
      }
      throw error;
    }
  }

  async getFileImageFills(accessToken: string, fileKey: string): Promise<any> {
    try {
      const url = `${figmaConfig.apiBaseUrl}/files/${fileKey}/images`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get file image fills: ${
            error.response?.data?.error ||
            error.response?.data?.err ||
            error.message
          }`
        );
      }
      throw error;
    }
  }
}
