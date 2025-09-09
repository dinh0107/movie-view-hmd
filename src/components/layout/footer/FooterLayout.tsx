"use client";

import { Film } from "lucide-react";
import Link from "next/link";

export default function FooterLayout() {
  const categories = [
    "Hành động",
    "Tình cảm",
    "Hoạt hình",
    "Kinh dị",
    "Phiêu lưu",
    "Hài",
    "Khoa học viễn tưởng",
    "Viễn tưởng",
    "Hình sự",
  ];

  const countries = [
    "Mỹ",
    "Việt Nam",
    "Hàn Quốc",
    "Nhật Bản",
    "Trung Quốc",
    "Ấn Độ",
    "Thái Lan",
    "Đài Loan",
    "Pháp",
  ];

  const types = ["Phim bộ", "Phim lẻ", "Phim chiếu rạp", "Phim hot"];

  const actors = [
    "Robert Downey Jr",
    "Chris Evans",
    "Tom Holland",
    "Scarlett Johansson",
    "Song Kang-ho",
    "Lee Byung-hun",
  ];

  const FooterColumn = ({
    title,
    items,
    prefix,
    split = false,
  }: {
    title: string;
    items: string[];
    prefix: string;
    split?: boolean;
  }) => {
    const half = split ? Math.ceil(items.length / 2) : items.length;
    return (
      <div>
        <h3 className="text-lg font-semibold text-red-400 mb-4">{title}</h3>
        <div className={`grid ${split ? "grid-cols-2 gap-6" : "grid-cols-1"}`}>
          {[items.slice(0, half), split ? items.slice(half) : []].map(
            (col, i) => (
              <ul key={i} className="space-y-2">
                {col.map((item, j) => (
                  <li key={j}>
                    <Link
                      href={`/${prefix}/${item
                        .toLowerCase()
                        .replace(/\s/g, "-")}`}
                      className="hover:text-red-400 transition"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <footer className="bg-black text-white px-6 pt-12 pb-6 border-t border-gray-800">
      <div className="max-w-7xl px-4 sm:px-6 mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl font-bold text-red-500"> 🎬 Rổ Phim</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <FooterColumn
            title="Thể loại"
            items={categories}
            prefix="categories"
          />
          <FooterColumn
            title="Quốc gia"
            items={countries}
            prefix="countries"
          />
          <FooterColumn title="Loại phim" items={types} prefix="types" />
          <FooterColumn
            title="Diễn viên nổi bật"
            items={actors}
            prefix="actors"
          />
        </div>
      </div>
      <div className="mt-10 border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} MovieHub. All rights reserved.
      </div>
    </footer>
  );
}
