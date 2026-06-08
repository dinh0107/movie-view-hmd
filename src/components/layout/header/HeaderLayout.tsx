"use client";

import Link from "next/link";
import HeaderMenu from "./HeaderMenu";
import SearchDialog from "./SearchDialog";
import MobileMenu from "./MobileMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { FilmIcon } from "lucide-react";

export default function HeaderLayout() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl"
        >
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FilmIcon className="size-5" />
          </span>
          <span className="brand-gradient">Phim ngay</span>
        </Link>

        <div className="hidden md:flex">
          <HeaderMenu />
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <SearchDialog />
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
