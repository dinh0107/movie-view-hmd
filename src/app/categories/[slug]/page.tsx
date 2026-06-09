import MoviesPage from "./CategoriesClient";
import { generateCategoryMetadata } from "./metadata";
import { MovieListSeo } from "@/components/seo/MovieListSeo";
import { fetchCategoryList } from "@/lib/movie-list-server";
import { buildCanonicalPath, pickParam, type SearchParams } from "@/lib/seo";

export const revalidate = 300;

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
  const page = Number(pickParam(sp, "page") ?? 1) || 1;
  const canonicalPath = buildCanonicalPath(`/categories/${slug}`, { page });

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
