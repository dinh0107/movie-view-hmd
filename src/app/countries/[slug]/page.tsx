import { Suspense } from "react";
import MoviesPage from "./CountruyClient";
import { PageLoader } from "@/components/movie/PageLoader";
import { generateCountryMetadata } from "./metadata";
import { MovieListSeo } from "@/components/seo/MovieListSeo";
import { fetchCountryList } from "@/lib/movie-list-server";
import { buildCanonicalPath, type SearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

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
  const canonicalPath = buildCanonicalPath(`/countries/${slug}`);

  return (
    <>
      <MovieListSeo
        title={initialData.title}
        movies={initialData.movies}
        canonicalPath={canonicalPath}
      />
      <Suspense fallback={<PageLoader />}>
        <MoviesPage slug={slug} initialData={initialData} />
      </Suspense>
    </>
  );
}
