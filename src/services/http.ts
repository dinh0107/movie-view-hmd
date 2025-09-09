import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { API_BASES, ApiBaseKey } from "../../config/api";

const instanceCache = new Map<ApiBaseKey, AxiosInstance>();

function createAxios(baseKey: ApiBaseKey): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASES[baseKey],
    headers: { Accept: "application/json" },
    timeout: 15000,
  });

  instance.interceptors.response.use(
    (r) => r,
    (err) => {
      const u = err?.config?.baseURL + err?.config?.url;
      console.error("HTTP Error:", err?.response?.status, u);
      throw err;
    }
  );

  return instance;
}

export function getAxios(baseKey: ApiBaseKey): AxiosInstance {
  if (!instanceCache.has(baseKey)) {
    instanceCache.set(baseKey, createAxios(baseKey));
  }
  return instanceCache.get(baseKey)!;
}
