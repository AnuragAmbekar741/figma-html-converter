import GLOBAL_CLIENT from "./global.client";

export const get = async <T>(
  url: string,
  params?: Record<string, unknown>
): Promise<T> => {
  const response = await GLOBAL_CLIENT.get<T>(url, { params });
  return response.data;
};

export const post = async <T, D extends Record<string, unknown>>(
  url: string,
  data?: D
): Promise<T> => {
  const response = await GLOBAL_CLIENT.post<T>(url, data);
  return response.data;
};
