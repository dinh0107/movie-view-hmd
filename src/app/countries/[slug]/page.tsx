import MoviesPage from "./CountruyClient";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { generateCountryMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateCountryMetadata>[0]
) {
  return generateCountryMetadata(props);
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
      <MoviesPage />
    </Suspense>
  );
}
