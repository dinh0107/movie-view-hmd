import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security-headers";

function withSecurity(res: NextResponse) {
  return applySecurityHeaders(res) as NextResponse;
}

const SEO_PATHS = /^\/(sitemap\.xml|robots\.txt|sitemap\/.*\.xml)$/;

export function middleware(req: NextRequest) {
  const u = new URL(req.url);

  if (SEO_PATHS.test(u.pathname)) {
    return withSecurity(NextResponse.next());
  }

  if (!u.pathname.startsWith("/types/") && !u.pathname.startsWith("/watch/")) {
    return withSecurity(NextResponse.next());
  }

  const WHITELIST = new Set(["category", "country", "year", "ep"]);

  ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "ref", "ref_src"].forEach(
    (k) => u.searchParams.delete(k)
  );

  if (u.searchParams.get("page") === "1") u.searchParams.delete("page");
  if (u.searchParams.get("limit") === "15") u.searchParams.delete("limit");
  if (!u.searchParams.get("sort_lang")) u.searchParams.delete("sort_lang");

  [...u.searchParams.keys()].forEach((k) => {
    if (!WHITELIST.has(k)) u.searchParams.delete(k);
  });

  const dest = u.toString();
  if (dest !== req.url) {
    return withSecurity(NextResponse.redirect(dest, 301));
  }

  return withSecurity(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
