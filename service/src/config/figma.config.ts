export const figmaConfig = {
  clientId: process.env.FIGMA_CLIENT_ID || "",
  clientSecret: process.env.FIGMA_CLIENT_SECRET || "",
  redirectUri:
    process.env.FIGMA_REDIRECT_URI ||
    "http://localhost:3000/auth/figma/callback",
  scope: process.env.FIGMA_SCOPE || "file_content:read current_user:read",
  state: process.env.FIGMA_OAUTH_STATE || "default_state_value",
  authorizationUrl: "https://www.figma.com/oauth",
  tokenUrl: "https://api.figma.com/v1/oauth/token",
  apiBaseUrl: "https://api.figma.com/v1",
};
