"use client";

import { FilmIcon } from "lucide-react";
import Link from "next/link";
import { useMenu } from "@/context/MenuContext";

const types = [
  { title: "Phim bộ", slug: "phim-bo" },
  { title: "Phim lẻ", slug: "phim-le" },
  { title: "Hoạt hình", slug: "hoat-hinh" },
];

export default function FooterLayout() {
  const { categories, countries } = useMenu();

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30 px-6 pb-8 pt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xl font-bold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FilmIcon className="size-5" />
          </span>
          <span className="brand-gradient">Phim ngay</span>
        </Link>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <FooterColumn title="Thể loại" prefix="categories" items={categories} />
          <FooterColumn title="Quốc gia" prefix="countries" items={countries} />
          <FooterColumn
            title="Loại phim"
            prefix="types"
            items={types.map((t) => ({ name: t.title, slug: t.slug }))}
          />
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-7xl border-t border-border/60 px-4 pt-6 text-center text-sm text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Phim ngay. All rights reserved.
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  items,
  prefix,
}: {
  title: string;
  items: { name: string; slug?: string }[];
  prefix: string;
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-primary">{title}</h3>
      <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
        {items.slice(0, 12).map((item) => (
          <li key={item.slug ?? item.name}>
            <Link
              href={`/${prefix}/${item.slug}`}
              className="text-sm text-muted-foreground transition hover:text-primary"
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
