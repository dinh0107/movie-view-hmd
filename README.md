This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

movie-view/
├── app/                         # App Router (Next.js 13+)
│   ├── layout.tsx               # Layout gốc (header/footer/global SEO)
│   ├── page.tsx                 # Trang chủ (SEO chính)
│   │
│   ├── movies/                  # Route cho danh sách & chi tiết phim
│   │   ├── page.tsx             # Trang danh sách phim (SEO: /movies)
│   │   ├── [slug]/              # Dynamic route cho phim chi tiết
│   │   │   ├── page.tsx         # Trang chi tiết phim (SEO: title, desc riêng)
│   │   │   └── metadata.ts      # SEO metadata riêng từng phim
│   │
│   ├── categories/              # Route cho thể loại phim
│   │   ├── [slug]/page.tsx      # SEO cho từng category
│   │
│   ├── search/
│   │   └── page.tsx             # Trang tìm kiếm phim (SEO: query)
│   │
│   ├── about/
│   │   └── page.tsx             # Trang giới thiệu
│   │
│   ├── sitemap.ts               # Sitemap.xml (SEO mạnh)
│   └── robots.txt               # Robots.txt
│
├── components/                  # Reusable UI components
│   ├── layout/                  # Header, Footer, Sidebar
│   ├── ui/                      # Button, Card, Modal
│   ├── seo/                     # SEO helpers, OpenGraph, JSON-LD
│
├── lib/                         # Logic chung (fetch API, helpers)
│   ├── api.ts                   # Hàm gọi API phim
│   ├── seo.ts                   # Generate metadata động
│
├── public/                      # Ảnh tĩnh, favicon, logo
│   ├── images/
│   └── og/                      # Ảnh OpenGraph share MXH
│
├── styles/                      # CSS/SCSS/Tailwind config
│   └── globals.css
│
├── prisma/ or models/           # Nếu dùng database ORM
│   └── movie.ts
│
├── next.config.js
├── package.json
└── tsconfig.json

