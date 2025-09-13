import MoviesPage from "./CategoriesClient";
export const dynamic = "force-static";

export const revalidate = 3600; 

export { generateMetadata } from "./metadata";

export default function Page() {
  return <MoviesPage />;
}
