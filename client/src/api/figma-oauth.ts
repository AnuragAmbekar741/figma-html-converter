import { get } from "../utils/request";
import GLOBAL_CLIENT from "../utils/global.client";

export const getAuthorizationUrl = (): string => {
  const baseURL = GLOBAL_CLIENT.defaults.baseURL || "http://localhost:3000";
  const url = `${baseURL}/auth/figma/authorize`;
  console.log("Authorization URL:", url);
  return url;
};

export const authorize = (): void => {
  const url = getAuthorizationUrl();
  console.log("Redirecting to:", url);
  // Use href instead of replace - more reliable for redirects
  window.location.href = url;
};

export const getUserInfo = async () => {
  return get<{
    success: boolean;
    user: {
      id: string;
      email: string;
      handle: string;
      img_url: string;
    };
  }>("/auth/figma/me");
};
