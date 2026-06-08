"use client";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { useMenu } from "@/context/MenuContext";
import Link from "next/link";

const types = [
  { title: "Phim bộ", slug: "phim-bo" },
  { title: "Phim lẻ", slug: "phim-le" },
  { title: "Hoạt hình", slug: "hoat-hinh" },
];

export default function HeaderMenu() {
  const { categories, countries } = useMenu();

  return (
    <Menubar className="space-x-1 border-0 bg-transparent p-0 shadow-none">
      <MenubarMenu>
        <MenubarTrigger className="nav-link cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
          <Link href="/">Trang chủ</Link>
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="nav-link cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
          Thể loại
        </MenubarTrigger>
        <MenubarContent className="w-[min(600px,90vw)] rounded-xl border-border/60 p-4 shadow-xl">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {categories.map((cat) => (
              <MenubarItem key={String(cat.id)} asChild>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="cursor-pointer justify-center rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
                >
                  {cat.name}
                </Link>
              </MenubarItem>
            ))}
          </div>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="nav-link cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
          Quốc gia
        </MenubarTrigger>
        <MenubarContent className="w-[min(600px,90vw)] rounded-xl border-border/60 p-4 shadow-xl">
          <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">
            {countries.map((c) => (
              <MenubarItem key={c.id} asChild>
                <Link
                  href={`/countries/${c.slug}`}
                  className="cursor-pointer justify-center rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
                >
                  {c.name}
                </Link>
              </MenubarItem>
            ))}
          </div>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="nav-link cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold data-[state=open]:bg-accent data-[state=open]:text-accent-foreground">
          Phim
        </MenubarTrigger>
        <MenubarContent className="w-44 rounded-xl border-border/60 p-2 shadow-xl">
          {types.map((t) => (
            <MenubarItem key={t.slug} asChild>
              <Link
                href={`/types/${t.slug}`}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm transition hover:bg-accent hover:text-accent-foreground"
              >
                {t.title}
              </Link>
            </MenubarItem>
          ))}
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
