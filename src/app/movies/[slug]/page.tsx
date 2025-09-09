import MovieDetailPage from "./MovieClient";
export { generateMetadata } from "./metadata";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MovieDetailPage slug={slug} />;
}
