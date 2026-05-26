import WatchPage from "./WatchClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { generateWatchMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateWatchMetadata>[0]
) {
  return generateWatchMetadata(props);
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen grid place-items-center bg-black text-white">
          <Loader2 className="h-10 w-10 animate-spin text-red-500" />
        </main>
      }
    >
      <WatchPage />
    </Suspense>
  );
}
