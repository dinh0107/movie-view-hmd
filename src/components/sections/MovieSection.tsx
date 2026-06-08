"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { movieService } from "@/services/apiService";
import { MovieCard, type MovieCardData } from "@/components/movie/MovieCard";

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
  movies: MovieCardData[];
  slug: string;
  api: string;
};

const MovieSection = ({ title, movies, slug, api }: MovieSectionProps) => {
  const href = api.startsWith("/the-loai")
    ? `/categories/${slug}`
    : `/types/${slug}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-14"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
        <Link
          href={href}
          className="text-sm font-medium text-primary transition hover:text-primary/80"
        >
          Xem thêm →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {movies.map((movie, i) => (
          <motion.div
            key={movie.slug || i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
};

export default function MovieCategories() {
  const [sections, setSections] = useState<
    { title: string; slug: string; api: string; movies: MovieCardData[] }[]
  >([]);

  useEffect(() => {
    const load = async () => {
      const data = await Promise.all(
        sectionsConfig.map(async (s) => {
          try {
            const movies = await movieService.getMoviesByType(s.api, 1, 12);
            return { ...s, movies: movies.slice(0, 12) };
          } catch {
            return { ...s, movies: [] };
          }
        })
      );
      setSections(data.filter((s) => s.movies.length > 0));
    };
    load();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {sections.map((s) => (
        <MovieSection key={s.slug} {...s} />
      ))}
    </div>
  );
}
