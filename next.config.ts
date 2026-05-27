import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** Bot nhận metadata blocking trong <head> (chuẩn SEO / social preview). */
const SEO_BOTS =
  /Googlebot|Google-InspectionTool|Storebot-Google|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Slackbot|Applebot|Pinterestbot|GPTBot|ClaudeBot|anthropic-ai|PerplexityBot|Bytespider/i;

const nextConfig: NextConfig = {
  htmlLimitedBots: SEO_BOTS,
  outputFileTracingRoot: projectRoot,
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
