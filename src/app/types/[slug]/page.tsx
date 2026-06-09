import { Suspense } from "react";
import TypesClient from "./TypesClient";
import { PageLoader } from "@/components/movie/PageLoader";
import { generateTypeMetadata } from "./metadata";
import { MovieListSeo } from "@/components/seo/MovieListSeo";
import { fetchTypeList } from "@/lib/movie-list-server";
import { buildCanonicalPath, pickParam, type SearchParams } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateTypeMetadata>[0]
) {
  return generateTypeMetadata(props);
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
  const initialData = await fetchTypeList(slug, sp);
  const page = Number(pickParam(sp, "page") ?? 1) || 1;
  const canonicalPath = buildCanonicalPath(`/types/${slug}`, { page });

  return (
    <>
      <MovieListSeo
        title={initialData.title}
        movies={initialData.movies}
        canonicalPath={canonicalPath}
      />
      <Suspense fallback={<PageLoader />}>
        <TypesClient slug={slug} initialData={initialData} />
      </Suspense>
    </>
  );
}
