import { NextResponse } from "next/server";

function slugifySegment(seg) {
  if (!seg) return seg;
  try { seg = decodeURIComponent(seg); } catch {}
  if (seg.includes(".")) return seg;
  let s = seg.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  s = s.replace(/đ/g, "d").replace(/Đ/g, "D");
  s = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return s || seg;
}

export function middleware(req) {
  const { pathname } = req.nextUrl;
  const parts = pathname.split("/");
  const normalized = parts.map((p, i) => (i === 0 ? "" : slugifySegment(p)));
  const newPath = normalized.join("/");

  if (newPath !== pathname) {
    const url = new URL(req.url);
    url.pathname = newPath;
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/types/:path*", "/watch/:path*"] };
