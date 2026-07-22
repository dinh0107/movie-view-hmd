import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { applySecurityHeaders } from "@/lib/security-headers";

function withSecurity(res: NextResponse) {
  return applySecurityHeaders(res) as NextResponse;
}

const SEO_PATHS = /^\/(sitemap\.xml|robots\.txt)$/;

const TRACKING_PARAMS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
  "ref",
  "ref_src",
  "mc_cid",
  "mc_eid",
];

/** Query được giữ theo từng nhóm route — giảm URL trùng làm mất index. */
function allowedParams(pathname: string): Set<string> {
  if (pathname.startsWith("/watch/")) {
    return new Set(["ep", "server"]);
  }
  if (
    pathname.startsWith("/types/") ||
    pathname.startsWith("/categories/") ||
    pathname.startsWith("/countries/")
  ) {
    return new Set(["page", "category", "country", "year", "sort_lang"]);
  }
  if (pathname.startsWith("/search")) {
    return new Set(["query", "page"]);
  }
  // /movies và trang khác: không giữ query
  return new Set();
}

function slugifySegment(seg: string) {
  if (!seg) return seg;
  let decoded = seg;
  try {
    decoded = decodeURIComponent(seg);
  } catch {
    // giữ nguyên
  }
  if (decoded.includes(".")) return decoded;
  let s = decoded.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/đ/g, "d").replace(/Đ/g, "D");
  s = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return s || decoded;
}

export function middleware(req: NextRequest) {
  const u = new URL(req.url);
  const { pathname } = u;

  if (SEO_PATHS.test(pathname)) {
    return withSecurity(NextResponse.next());
  }

  // Chuẩn hóa slug path (bỏ dấu) cho types/watch
  if (pathname.startsWith("/types/") || pathname.startsWith("/watch/")) {
    const parts = pathname.split("/");
    const normalized = parts.map((p, i) => (i === 0 ? "" : slugifySegment(p)));
    const newPath = normalized.join("/");
    if (newPath !== pathname) {
      u.pathname = newPath;
      return withSecurity(NextResponse.redirect(u, 308));
    }
  }

  // /movies/[slug] không dùng query — bỏ hết để tránh duplicate
  if (pathname.startsWith("/movies/")) {
    if ([...u.searchParams.keys()].length > 0) {
      u.search = "";
      return withSecurity(NextResponse.redirect(u, 301));
    }
    return withSecurity(NextResponse.next());
  }

  const shouldCleanQuery =
    pathname.startsWith("/types/") ||
    pathname.startsWith("/categories/") ||
    pathname.startsWith("/countries/") ||
    pathname.startsWith("/watch/") ||
    pathname.startsWith("/search");

  if (!shouldCleanQuery) {
    return withSecurity(NextResponse.next());
  }

  const whitelist = allowedParams(pathname);

  TRACKING_PARAMS.forEach((k) => u.searchParams.delete(k));

  if (u.searchParams.get("page") === "1") u.searchParams.delete("page");
  if (u.searchParams.get("limit") === "15") u.searchParams.delete("limit");
  if (!u.searchParams.get("sort_lang")) u.searchParams.delete("sort_lang");

  [...u.searchParams.keys()].forEach((k) => {
    if (!whitelist.has(k)) u.searchParams.delete(k);
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
