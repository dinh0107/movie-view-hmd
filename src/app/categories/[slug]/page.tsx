import MoviesPage from "./CategoriesClient";

export const revalidate = 3600; 

export { generateMetadata } from "./metadata";

export default function Page() {
  return <MoviesPage />;
}
