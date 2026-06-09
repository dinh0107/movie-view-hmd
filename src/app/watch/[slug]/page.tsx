import { Suspense } from "react";
import WatchPage from "./WatchClient";
import { generateWatchMetadata } from "./metadata";
import { WatchSeo } from "@/components/seo/WatchSeo";
import { PageLoader } from "@/components/movie/PageLoader";
import { fetchMovieDetailServer } from "@/lib/phimapi-server";
import { pickParam, type SearchParams } from "@/lib/seo";

export const revalidate = 600;

export async function generateMetadata(
  props: Parameters<typeof generateWatchMetadata>[0]
) {
  return generateWatchMetadata(props);
}

function parseIndex(value: string | undefined, fallback = 0): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : fallback;
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
  const initialDetail = await fetchMovieDetailServer(slug);
  const epIdx = parseIndex(pickParam(sp, "ep"));
  const serverIdx = parseIndex(pickParam(sp, "server"));

  return (
    <>
      {initialDetail ? (
        <WatchSeo
          detail={initialDetail}
          slug={slug}
          epIdx={epIdx}
          serverIdx={serverIdx}
        />
      ) : null}
      <Suspense fallback={<PageLoader />}>
        <WatchPage slug={slug} initialDetail={initialDetail} />
      </Suspense>
    </>
  );
}
