import React, { Suspense } from "react";
import SearchPage from "./SearchClient"; 
import { generateMetadata } from "./metadata";

export { generateMetadata };

export default function Page() {
  return (
    <Suspense fallback={<div>Đang tải kết quả tìm kiếm...</div>}>
      <SearchPage />
    </Suspense>
  );
}
