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
    <Menubar className="bg-transparent border-0 text-gray-200 space-x-6">
      <MenubarMenu>
        <MenubarTrigger className="text-gray-200 hover:text-red-400 transition cursor-pointer text-lg font-semibold">
          <Link href={`/`}>Trang chủ</Link>
        </MenubarTrigger>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="text-gray-200 hover:text-red-400 transition cursor-pointer text-lg font-semibold">
          Thể loại
        </MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-200 p-4 rounded-lg w-[600px]">
          <div className="grid grid-cols-4 gap-2">
            {categories.map((cat) => (
              <MenubarItem key={String(cat.id)} asChild>
                <Link
                  href={`/categories/${cat.slug}`}
                  className="px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-red-400 transition cursor-pointer justify-center"
                >
                  {cat.name}
                </Link>
              </MenubarItem>
            ))}
          </div>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="text-gray-200 hover:text-red-400 transition cursor-pointer text-lg font-semibold">
          Quốc gia
        </MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-200 p-4 rounded-lg w-[600px]">
          <div className="grid grid-cols-4 gap-2">
            {countries.map((c) => (
              <MenubarItem key={c.id} asChild>
                <Link
                  href={`/countries/${c.slug}`}
                  className="px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-red-400 transition cursor-pointer justify-center"
                >
                  {c.name}
                </Link>
              </MenubarItem>
            ))}
          </div>
        </MenubarContent>
      </MenubarMenu>

      <MenubarMenu>
        <MenubarTrigger className="text-gray-200 hover:text-red-400 transition cursor-pointer text-lg font-semibold">
          Phim
        </MenubarTrigger>
        <MenubarContent className="bg-gray-900 text-gray-200 p-4 rounded-lg w-[160px]">
          <div className="grid grid-cols-1 gap-2">
            {types.map((t, index) => (
              <MenubarItem key={index} asChild>
                <Link
                  href={`/types/${t.slug}`}
                  className="px-3 py-2 text-sm rounded-md hover:bg-gray-800 hover:text-red-400 transition cursor-pointer"
                >
                  {t.title}
                </Link>
              </MenubarItem>
            ))}
          </div>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
