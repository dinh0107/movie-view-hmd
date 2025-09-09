// app/og/route.ts
import type { NextRequest } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";         
export const dynamic = "force-dynamic";  

const TARGET_W = 1200;
const TARGET_H = 630;

const ALLOW = new Set(["phimimg.com", "image.tmdb.org"]);

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const src = url.searchParams.get("src");
        const title = (url.searchParams.get("title") || "").slice(0, 120);
        const mode = (url.searchParams.get("mode") || "auto").toLowerCase(); 

        if (!src) return new Response("Missing src", { status: 400 });

        let u: URL;
        try {
            u = new URL(src);
        } catch {
            return new Response("Bad src", { status: 400 });
        }
        if (!ALLOW.has(u.hostname)) return new Response("Forbidden domain", { status: 403 });

        const r = await fetch(src, { cache: "no-store" });
        if (!r.ok) return new Response("Fetch failed", { status: 502 });

        const original = Buffer.from(await r.arrayBuffer());

        const meta = await sharp(original).metadata();
        const ar = (meta.width ?? 1) / (meta.height ?? 1); 

        const overlaySvg = title
            ? Buffer.from(`
        <svg width="${TARGET_W}" height="${TARGET_H}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stop-color="rgba(0,0,0,0.78)"/>
              <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
            </linearGradient>
            <filter id="s">
              <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="black" flood-opacity="0.6"/>
            </filter>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#g)"/>
          <style>
            .t{
              font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, 'Helvetica Neue', Arial;
              fill:#fff; font-weight:800;
            }
          </style>
          <text x="48" y="${TARGET_H - 56}" class="t" font-size="56" filter="url(#s)">${escapeXml(title)}</text>
        </svg>
      `)
            : undefined;

        const doCrop = async () =>
            sharp(original)
                .resize(TARGET_W, TARGET_H, { fit: "cover", position: "entropy" })
                .composite(overlaySvg ? [{ input: overlaySvg, top: 0, left: 0 }] : [])
                .jpeg({ quality: 85, progressive: true, mozjpeg: true })
                .toBuffer();

        const doLetterbox = async () => {
            const bg = await sharp(original)
                .resize(TARGET_W, TARGET_H, { fit: "cover" })
                .blur(20)
                .modulate({ brightness: 0.7, saturation: 0.9 })
                .toBuffer();

            const fg = await sharp(original)
                .resize(TARGET_W, TARGET_H, {
                    fit: "contain",
                    background: { r: 0, g: 0, b: 0, alpha: 1 },
                })
                .toBuffer();

            return sharp(bg)
                .composite([
                    { input: fg, gravity: "center" },
                    ...(overlaySvg ? [{ input: overlaySvg, top: 0, left: 0 }] : []),
                ])
                .jpeg({ quality: 85, progressive: true, mozjpeg: true })
                .toBuffer();
        };

        const outBuf =
            mode === "crop" || (mode === "auto" && ar >= 1.6)
                ? await doCrop()
                : await doLetterbox();

        const blob = new Blob(
            [new Uint8Array(outBuf)],
            { type: "image/jpeg" }
        );


        return new Response(blob, {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=2592000, immutable",
            },
        });
    } catch (e) {
        console.error("OG error:", e);
        return new Response("Server error", { status: 500 });
    }
}

function escapeXml(s: string) {
    return s.replace(/[&<>"']/g, (c) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" } as Record<string, string>)[c]
    );
}
