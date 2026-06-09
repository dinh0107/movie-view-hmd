function resolveSiteUrl(): string {
  const fromEnv =
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) {
    return fromEnv.replace(/\/+$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }
  return "https://phimngay.top";
}

export const SITE_URL = resolveSiteUrl();
