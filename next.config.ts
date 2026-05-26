import type { NextConfig } from "next";

/** Bot nhận metadata blocking trong <head> (chuẩn SEO / social preview). */
const SEO_BOTS =
  /Googlebot|Google-InspectionTool|Storebot-Google|Bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Discordbot|Slackbot|Applebot|Pinterestbot|GPTBot|ClaudeBot|anthropic-ai|PerplexityBot|Bytespider/i;

const nextConfig: NextConfig = {
  htmlLimitedBots: SEO_BOTS,
};

export default nextConfig;
