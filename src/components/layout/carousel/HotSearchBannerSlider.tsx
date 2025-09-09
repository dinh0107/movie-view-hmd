"use client";

import { motion } from "framer-motion";
import { Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { apiGet } from "@/services/axiosClient";
import { movieDetailService } from "@/services/apiService";

type Movie = {
  id: string;
  title: string;
  slug: string;
  duration: string;
  description: string;
  year: string;
  seasons?: string;
  rating?: number;
  genres: string[];
  tags: string[];
  starring: string[];
  backdrop: string;
  poster: string;
};

const containerVariants = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

export default function HotSearchBannerSlider() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await apiGet<any>(
          "/quoc-gia/au-my?page=1&limit=6",
          { baseKey: "phim_v1" }
        );
        const items = res?.data?.items ?? [];

        const details = await Promise.all(
          items.map(async (item: any) => {
            const detailRes = await movieDetailService.getMovieDetail(
              String(item.slug)
            );
            const movie = detailRes;
            if (!movie) return null;

            return {
              id: movie.id,
              title: movie.name,
              duration: movie.time || "",
              slug: movie.slug || "",
              description: movie.content || "",
              year: String(movie.year || ""),
              seasons: movie.episode_current || undefined,
              rating: movie.rating,
              genres: movie.category?.map((c: any) => c.name) || [],
              tags: movie.country?.map((c: any) => c.name) || [],
              starring: movie.actor || [],
              backdrop: movie.thumb_url
                ? `${movie.thumb_url}`
                : movie.poster_url,
              poster: movie.poster_url
                ? `${movie.poster_url}`
                : movie.thumb_url,
            } as Movie;
          })
        );

        const validMovies = details.filter(Boolean) as Movie[];
        setMovies(validMovies);
        setActiveMovie(validMovies[0] || null);
      } catch (e) {
        console.error("Fetch hot search movies error:", e);
      }
    };

    fetchMovies();
  }, []);

  if (!activeMovie) {
    return (
      <div className="relative w-full aspect-video md:aspect-[21/9] lg:aspect-[16/9] min-h-[400px] bg-black text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video md:aspect-[21/9] lg:aspect-[16/9] min-h-[400px] sm:min-h-[500px] md:min-h-[600px] bg-black text-white overflow-hidden">
      {/* Mobile Swiper */}
      <div className="absolute inset-0 block 2xl:hidden">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop
          onSlideChange={(swiper) => setActiveMovie(movies[swiper.realIndex])}
          className="w-full h-full"
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <motion.div
                className="absolute inset-0 w-full h-full"
                style={{
                  backgroundImage: `url(${movie.backdrop})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent" />
                <div className="absolute inset-0 bg-black/30" />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop backdrop */}
      <motion.div
        key={activeMovie.id}
        className="absolute inset-0 hidden 2xl:block"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          backgroundImage: `url(${activeMovie.backdrop})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent"></div>
      </motion.div>

      <div className="relative z-10 h-full flex items-center gap-10 px-6 lg:px-16">
        {/* Vertical slider (desktop left) */}
        <div className="hidden 2xl:flex w-1/4 h-full flex-col justify-center bg-black/50 p-10">
          <Swiper
            slidesPerView={4}
            spaceBetween={20}
            direction="vertical"
            loop
            modules={[Autoplay]}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            onSlideChange={(swiper) => setActiveMovie(movies[swiper.realIndex])}
            className="h-fit"
          >
            {movies.map((movie) => (
              <SwiperSlide key={movie.id}>
                <motion.div
                  className={`relative cursor-pointer rounded-lg overflow-hidden transition-all ${
                    activeMovie.id === movie.id
                      ? "border-2 border-red-500 shadow-lg"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  onClick={() => setActiveMovie(movie)}
                >
                  <img
                    src={movie.backdrop}
                    alt={movie.title}
                    className="w-full aspect-[16/9] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  <div className="absolute bottom-2 left-3 text-white">
                    <h4 className="font-semibold">{movie.title}</h4>
                    <p className="text-xs text-gray-300">{movie.duration}</p>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Content */}
        <motion.div
          key={activeMovie.title}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-lg sm:max-w-xl space-y-4 mb-8 sm:mb-10"
        >
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold drop-shadow-lg leading-tight"
          >
            {activeMovie.title}
          </motion.h1>

          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm md:text-base text-gray-300"
          >
            {activeMovie.seasons && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-800/70 rounded-full text-[10px] sm:text-xs md:text-sm">
                {activeMovie.seasons}
              </span>
            )}
            {activeMovie.rating && (
              <span className="text-yellow-400 font-bold">
                ⭐ {activeMovie.rating}/5 IMDb
              </span>
            )}
            <span className="text-gray-400">{activeMovie.year}</span>
          </motion.div>

          <motion.p
            variants={itemVariants}
            className="text-gray-300 leading-relaxed line-clamp-3 text-sm sm:text-base md:text-lg"
          >
            {activeMovie.description}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="text-xs sm:text-sm md:text-base space-y-1"
          >
            <p>
              <span className="font-semibold text-red-400">Quốc gia:</span>{" "}
              {activeMovie.tags.join(", ")}
            </p>
            <p>
              <span className="font-semibold text-red-400">Thể loại:</span>{" "}
              {activeMovie.genres.join(", ")}
            </p>
            <p>
              <span className="font-semibold text-red-400">Diễn viên:</span>{" "}
              {activeMovie.starring.join(", ")}
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link
              href={`/movies/${activeMovie.slug}`}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-3 sm:px-5 py-1.5 sm:py-3 rounded-lg font-semibold transition shadow-lg text-sm sm:text-base md:text-lg"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5" /> Xem ngay
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
