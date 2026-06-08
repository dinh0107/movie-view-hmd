import SearchPage from "@/app/search/SearchClient";
import { Suspense } from "react";
import { PageLoader } from "@/components/movie/PageLoader";
import { generateSearchMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateSearchMetadata>[0]
) {
  return generateSearchMetadata(props);
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <SearchPage />
    </Suspense>
  );
}
