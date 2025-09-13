import MoviesPage from "./CountruyClient";
export { generateMetadata } from "./metadata";

export const dynamic = "force-static";

export const revalidate = 3600; 


export default function Page() {
  return <MoviesPage />;
}
