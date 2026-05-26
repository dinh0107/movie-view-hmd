import MovieDetailPage from "./MovieClient";
import { generateMovieMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateMovieMetadata>[0]
) {
  return generateMovieMetadata(props);
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MovieDetailPage slug={slug} />;
}
