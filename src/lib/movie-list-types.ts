export type ListMovie = {
  id: string;
  name: string;
  slug: string;
  poster_url: string;
  thumb_url: string;
  year: number;
  episode_current: string;
};

export type MovieListResult = {
  movies: ListMovie[];
  title: string;
  page: number;
  totalPages: number;
};
