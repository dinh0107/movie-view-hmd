export const API_BASES = {
  phim_root: "https://phimapi.com",
  phim_v1:   "https://phimapi.com/v1/api",
} as const;

export type ApiBaseKey = keyof typeof API_BASES;

export function resolveBaseByPath(path: string): ApiBaseKey {
  if (/^\/?v1\//i.test(path)) return "phim_v1";
  return "phim_root";
}
