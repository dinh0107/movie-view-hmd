import MoviesPage from "./CountruyClient";
export { generateMetadata } from "./metadata";


export const revalidate = 3600; 


export default function Page() {
  return <MoviesPage />;
}
