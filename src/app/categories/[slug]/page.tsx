import { Suspense } from "react";
import MoviesPage from "./CategoriesClient";
import { PageLoader } from "@/components/movie/PageLoader";
import { generateCategoryMetadata } from "./metadata";
import { MovieListSeo } from "@/components/seo/MovieListSeo";
import { fetchCategoryList } from "@/lib/movie-list-server";
import { buildCanonicalPath, type SearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateCategoryMetadata>[0]
) {
  return generateCategoryMetadata(props);
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
  const initialData = await fetchCategoryList(slug, sp);
  const canonicalPath = buildCanonicalPath(`/categories/${slug}`);

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
