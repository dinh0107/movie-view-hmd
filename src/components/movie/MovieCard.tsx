import Link from "next/link";
import { Play } from "lucide-react";

export type MovieCardData = {
  id?: string;
  name: string;
  slug: string;
  poster_url?: string;
  thumb_url?: string;
  year?: number | string;
  episode_current?: string;
};

export function MovieCard({ movie }: { movie: MovieCardData }) {
  const poster = movie.poster_url || movie.thumb_url || "/no-image.jpg";

  return (
    <article className="group relative overflow-hidden rounded-2xl glass-card aspect-[2/3] transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
      <Link href={`/movies/${movie.slug}`} className="block aspect-[2/3] w-full overflow-hidden">
        <img
          src={poster}
          alt={movie.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </Link>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent opacity-90" />

      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
        {movie.year ? (
          <span className="rounded-md bg-background/80 px-2 py-0.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
            {movie.year}
          </span>
        ) : null}
        {movie.episode_current ? (
          <span className="rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-sm">
            {movie.episode_current}
          </span>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold text-foreground sm:text-base">
          {movie.name}
        </h3>
        <Link
          href={`/movies/${movie.slug}`}
          className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
        >
          <Play className="size-3.5 fill-current" />
          Xem ngay
        </Link>
      </div>
    </article>
  );
}
