import WatchPage from "./WatchClient";
import { Suspense } from "react";
import { PageLoader } from "@/components/movie/PageLoader";
import { generateWatchMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateWatchMetadata>[0]
) {
  return generateWatchMetadata(props);
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <WatchPage />
    </Suspense>
  );
}
