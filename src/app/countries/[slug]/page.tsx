import MoviesPage from "./CountruyClient";
import { generateCountryMetadata } from "./metadata";
import { MovieListSeo } from "@/components/seo/MovieListSeo";
import { fetchCountryList } from "@/lib/movie-list-server";
import { buildCanonicalPath, pickParam, type SearchParams } from "@/lib/seo";

export const revalidate = 300;

export async function generateMetadata(
  props: Parameters<typeof generateCountryMetadata>[0]
) {
  return generateCountryMetadata(props);
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const initialData = await fetchCountryList(slug, sp);
  const page = Number(pickParam(sp, "page") ?? 1) || 1;
  const canonicalPath = buildCanonicalPath(`/countries/${slug}`, { page });

  return (
    <>
      <MovieListSeo
        title={initialData.title}
        movies={initialData.movies}
        canonicalPath={canonicalPath}
      />
      <MoviesPage slug={slug} initialData={initialData} />
    </>
  );
}
