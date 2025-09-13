import React, { Suspense } from "react";
import SearchPage from "./SearchClient"; 
import { generateMetadata } from "./metadata";
export const dynamic = "force-static";

export const revalidate = 3600; 
export { generateMetadata };

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải kết quả tìm kiếm...</div>}>
      <SearchPage />
    </Suspense>
  );
}
