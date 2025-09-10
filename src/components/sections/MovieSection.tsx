"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";
import { movieService } from "@/services/apiService";

const sectionsConfig = [
  { title: "Phim mới cập nhật", slug: "phim-moi-cap-nhat", api: "/danh-sach/phim-moi-cap-nhat-v2" },
  { title: "Phim bộ", slug: "phim-bo", api: "/danh-sach/phim-bo" },
  { title: "Phim lẻ", slug: "phim-le", api: "/danh-sach/phim-le" },
  { title: "Phim hoạt hình", slug: "hoat-hinh", api: "/danh-sach/hoat-hinh" },
  { title: "TV Show", slug: "tv-shows", api: "/danh-sach/tv-shows" },
  { title: "Phim 18+", slug: "phim-18", api: "/the-loai/phim-18" },
];

type MovieSectionProps = {
  title: string;
  movies: Movie[];
  slug: string;
  api: string;
};

interface Movie {
  id: string;
  name: string;
  slug: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  episode_current: string;
}

const MovieSection = ({ title, movies, slug, api }: MovieSectionProps) => {
  const href = api.startsWith("/the-loai")
    ? `/categories/${slug}`
    : `/types/${slug}`;

  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white">{title}</h2>
        <Link
          href={href}
          className="text-sm sm:text-base text-red-500 hover:text-red-600 transition-colors duration-300"
        >
          Xem thêm
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map((movie, i) => (
          <Link key={movie.slug || i} href={`/movies/${movie.slug}`}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative cursor-pointer rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition"
            >
              <img
                src={movie.thumb_url || movie.poster_url}
                alt={movie.name}
                className="w-full aspect-[0.7] object-cover transition-transform duration-300 hover:scale-110"
              />

              {movie.episode_current && (
                <span className="absolute top-2 left-2 bg-black/85 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">
                  {movie.episode_current}
                </span>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-3">
                <h3 className="text-white font-bold text-sm sm:text-base line-clamp-2 mb-2">
                  {movie.name}
                </h3>
                <button className="flex items-center justify-center gap-2 cursor-pointer bg-red-500 hover:bg-red-6  00 text-white px-4 py-2 rounded-lg text-sm font-bold transition transform hover:scale-105">
                  <Play size={16} /> Xem ngay
                </button>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default function MovieCategories() {
  const [sections, setSections] = useState<
    { title: string; slug: string; movies: Movie[]; api: string }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await Promise.all(
        sectionsConfig.map(async (sec) => ({
          ...sec,
          movies: await movieService.getMoviesByType(sec.api, 1, 12),
        }))
      );
      setSections(data);
    };

    fetchData();
  }, []);

  return (
    <div className="px-4 sm:px-8 py-8">
      {sections.map((sec) => (
        <MovieSection
          key={sec.title}
          title={sec.title}
          movies={sec.movies}
          slug={sec.slug}
          api={sec.api}
        />
      ))}
    </div>
  );
}
