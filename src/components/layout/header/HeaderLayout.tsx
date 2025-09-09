"use client";

import Link from "next/link";
import HeaderMenu from "./HeaderMenu";
import SearchDialog from "./SearchDialog";
import MobileMenu from "./MobileMenu";

export default function HeaderLayout() {
  return (
    <header className="w-full bg-black text-white relative top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
        <Link
          href="/"
          className="text-xl sm:text-2xl font-bold text-red-500 tracking-wide"
        >
          🎬 Rổ Phim
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
