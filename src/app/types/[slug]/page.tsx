import TypesClient from "./TypesClient";
import { Suspense } from "react";
import { PageLoader } from "@/components/movie/PageLoader";
import { generateTypeMetadata } from "./metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: Parameters<typeof generateTypeMetadata>[0]
) {
  return generateTypeMetadata(props);
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TypesClient />
    </Suspense>
  );
}
