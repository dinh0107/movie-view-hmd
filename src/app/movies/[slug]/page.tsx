import MovieDetailPage from "./MovieClient";
export { generateMetadata } from "./metadata";
export const dynamic = "force-static";

export const revalidate = 3600; 
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <MovieDetailPage slug={slug} />;
}
