import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const u = new URL(req.url);

  if (!u.pathname.startsWith("/types/") && !u.pathname.startsWith("/watch/")) {
    return NextResponse.next();
  }

  const WHITELIST = new Set(["category", "country", "year", "ep"]);

  ["utm_source", "utm_medium", "utm_campaign", "gclid", "fbclid", "ref", "ref_src"].forEach((k) =>
    u.searchParams.delete(k)
  );

  if (u.searchParams.get("page") === "1") u.searchParams.delete("page");
  if (u.searchParams.get("limit") === "15") u.searchParams.delete("limit");
  if (!u.searchParams.get("sort_lang")) u.searchParams.delete("sort_lang");

  [...u.searchParams.keys()].forEach((k) => {
    if (!WHITELIST.has(k)) u.searchParams.delete(k);
  });

  const dest = u.toString();
  if (dest !== req.url) {
    return NextResponse.redirect(dest, 301);
  }

  return NextResponse.next();
}
