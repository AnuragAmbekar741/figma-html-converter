import axios from "axios";
import { figmaConfig } from "../config/figma.config";

export class FigmaService {
  getAuthorizationUrl(state?: string): string {
    const params = new URLSearchParams({
      client_id: figmaConfig.clientId,
      redirect_uri: figmaConfig.redirectUri,
      scope: figmaConfig.scope,
      state: state || "",
      response_type: "code",
    });

    return `${figmaConfig.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForToken(
    code: string
  ): Promise<{ access_token: string; refresh_token?: string }> {
    try {
      const response = await axios.post(
        figmaConfig.tokenUrl,
        {
          client_id: figmaConfig.clientId,
          client_secret: figmaConfig.clientSecret,
          redirect_uri: figmaConfig.redirectUri,
          code,
          grant_type: "authorization_code",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to exchange code for token: ${
            error.response?.data?.error || error.message
          }`
        );
      }
      throw error;
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get(`${figmaConfig.apiBaseUrl}/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to get user info: ${
            error.response?.data?.error || error.message
          }`
        );
      }
      throw error;
    }
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<{ access_token: string; refresh_token?: string }> {
    try {
      const response = await axios.post(
        figmaConfig.tokenUrl,
        {
          client_id: figmaConfig.clientId,
          client_secret: figmaConfig.clientSecret,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          `Failed to refresh token: ${
            error.response?.data?.error || error.message
          }`
        );
      }
      throw error;
    }
  }
}
