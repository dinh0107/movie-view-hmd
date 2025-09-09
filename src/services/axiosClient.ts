// services/apiClient.ts
import { AxiosRequestConfig } from "axios";
import { getAxios } from "./http";
import { ApiBaseKey, resolveBaseByPath } from "../../config/api";

type RequestOpts = {
  baseKey?: ApiBaseKey;    
  fallbackBases?: ApiBaseKey[]; 
  config?: AxiosRequestConfig;
};

export async function apiGet<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const primary = opts.baseKey ?? resolveBaseByPath(path);
  const candidates = [primary, ...(opts.fallbackBases ?? [])];

  let lastErr: any;
  for (const key of candidates) {
    try {
      const axios = getAxios(key);
      const res = await axios.get<T>(path, opts.config);
      return res.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

export async function apiPost<T>(path: string, body: any, opts: RequestOpts = {}): Promise<T> {
  const primary = opts.baseKey ?? resolveBaseByPath(path);
  const candidates = [primary, ...(opts.fallbackBases ?? [])];
  let lastErr: any;
  for (const key of candidates) {
    try {
      const axios = getAxios(key);
      const res = await axios.post<T>(path, body, opts.config);
      return res.data;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}
