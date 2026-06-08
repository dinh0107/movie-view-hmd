import MoviesPage from "./CategoriesClient";
import { Suspense } from "react";
import { PageLoader } from "@/components/movie/PageLoader";
import { generateCategoryMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateCategoryMetadata>[0]
) {
  return generateCategoryMetadata(props);
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MoviesPage />
    </Suspense>
  );
}
