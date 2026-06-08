import MoviesPage from "./CountruyClient";
import { Suspense } from "react";
import { PageLoader } from "@/components/movie/PageLoader";
import { generateCountryMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateCountryMetadata>[0]
) {
  return generateCountryMetadata(props);
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MoviesPage />
    </Suspense>
  );
}
