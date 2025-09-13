"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import Link from "next/link";

type MovieItem = {
  id: string | number;
  title: string;
  slug: string;
  poster: string;
  year?: number;
};

export default function CategorySwiper({ movies }: { movies: MovieItem[] }) {
  if (!movies.length) return null;

  return (
    <div className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 mt-6">
      <h2 className="mb-4 text-2xl sm:text-3xl font-bold text-white">Có thể bạn cũng muốn xem</h2>
      <Swiper
        modules={[Navigation , Autoplay]}
        navigation
        spaceBetween={16}
        slidesPerView={2}
        autoplay={{
          delay: 3000,        
          disableOnInteraction: false, 
        }}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
      >
        {movies.map((m) => (
          <SwiperSlide key={m.id}>
            <Link
              href={`/movies/${m.slug}`} prefetch={false}
              className="block overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
            >
              <img
                src={m.poster}
                alt={m.title}
                className="aspect-[2/3] w-full object-cover"
              />
              <div className="p-2">
                <p className="line-clamp-1 text-sm font-semibold">{m.title}</p>
                {m.year && (
                  <p className="text-xs text-white/60">{m.year}</p>
                )}
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
