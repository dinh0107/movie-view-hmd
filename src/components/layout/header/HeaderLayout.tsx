"use client";

import Link from "next/link";
import HeaderMenu from "./HeaderMenu";
import SearchDialog from "./SearchDialog";
import MobileMenu from "./MobileMenu";
import { Film, FilmIcon } from "lucide-react";
import Image from "next/image";

export default function HeaderLayout() {
  return (
    <header className="w-full bg-black text-white top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold tracking-wide flex items-center justify-center gap-2 
             bg-gradient-to-r from-red-600 via-pink-500  to-purple-700  
             bg-clip-text text-transparent"
        >
          <FilmIcon className="w-6 h-6 text-red-500" />
          <Image
            src={"https://www.phimngay.top/og/logo.png"}
            width={48}
            alt="Phim Ngay Logo"
            height={48}
            className="rounded-full object-contain"></Image>
        </Link>

        <div className="hidden md:flex">
          <HeaderMenu />
        </div>

        <div className="flex items-center gap-2">
          <SearchDialog />
          <div className="md:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
