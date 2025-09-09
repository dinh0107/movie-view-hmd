"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useMenu } from "@/context/MenuContext";
import { Menu } from "lucide-react";
import Link from "next/link";

const types = [
  { title: "Phim bộ", slug: "phim-bo" },
  { title: "Phim lẻ", slug: "phim-le" },
  { title: "Hoạt hình", slug: "hoat-hinh" },
];

export default function MobileMenu() {
  const { categories, countries, loading } = useMenu();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:text-red-400"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="bg-gray-900 text-white p-6">
        <SheetHeader className="hidden">
          <SheetTitle></SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4 overflow-y-auto hidden-scrollbar">
          <SheetClose asChild>
            <Link href="/" className="hover:text-red-400">
              Trang chủ
            </Link>
          </SheetClose>

          <div>
            <p className="text-red-400 font-semibold">Thể loại</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {categories.map((cat) => (
                <SheetClose asChild key={cat.id}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="text-sm hover:text-red-400"
                  >
                    {cat.name}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>

          <div>
            <p className="text-red-400 font-semibold">Quốc gia</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {countries.map((c) => (
                <SheetClose asChild key={c.id}>
                  <Link
                    href={`/countries/${c.slug}`}
                    className="text-sm hover:text-red-400"
                  >
                    {c.name}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>

          <div>
            <p className="text-red-400 font-semibold">Phim</p>
            <div className="flex flex-col gap-2 mt-2">
              {types.map((t, idx) => (
                <SheetClose asChild key={idx}>
                  <Link
                    href={`/types/${t.slug}`}
                    className="text-sm hover:text-red-400"
                  >
                    {t.title}
                  </Link>
                </SheetClose>
              ))}
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
