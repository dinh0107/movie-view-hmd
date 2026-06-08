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
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const types = [
  { title: "Phim bộ", slug: "phim-bo" },
  { title: "Phim lẻ", slug: "phim-le" },
  { title: "Hoạt hình", slug: "hoat-hinh" },
];

export default function MobileMenu() {
  const { categories, countries } = useMenu();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(320px,85vw)] border-border/60 bg-background p-6">
        <SheetHeader>
          <SheetTitle className="text-left text-lg font-bold brand-gradient">
            Menu
          </SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Giao diện</span>
          <ThemeToggle />
        </div>
        <nav className="mt-4 flex flex-col gap-6 overflow-y-auto hidden-scrollbar">
          <SheetClose asChild>
            <Link href="/" className="font-medium text-foreground hover:text-primary">
              Trang chủ
            </Link>
          </SheetClose>

          <MobileSection title="Thể loại">
            {categories.map((cat) => (
              <SheetClose asChild key={cat.id}>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {cat.name}
                </Link>
              </SheetClose>
            ))}
          </MobileSection>

          <MobileSection title="Quốc gia">
            {countries.map((c) => (
              <SheetClose asChild key={c.id}>
                <Link
                  href={`/countries/${c.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {c.name}
                </Link>
              </SheetClose>
            ))}
          </MobileSection>

          <MobileSection title="Phim" cols={1}>
            {types.map((t) => (
              <SheetClose asChild key={t.slug}>
                <Link
                  href={`/types/${t.slug}`}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  {t.title}
                </Link>
              </SheetClose>
            ))}
          </MobileSection>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileSection({
  title,
  children,
  cols = 2,
}: {
  title: string;
  children: React.ReactNode;
  cols?: 1 | 2;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-primary">{title}</p>
      <div className={`grid gap-2 ${cols === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {children}
      </div>
    </div>
  );
}
