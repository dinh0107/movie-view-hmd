"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";

export function useListUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);

  const getParam = useCallback(
    (key: string) => searchParams.get(key) ?? "",
    [searchParams]
  );

  const pushParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (!value) params.delete(key);
        else params.set(key, value);
      }
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, searchParams]
  );

  const setPage = useCallback(
    (nextPage: number) => {
      pushParams({ page: nextPage <= 1 ? null : String(nextPage) });
    },
    [pushParams]
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      pushParams({ [key]: value || null, page: null });
    },
    [pushParams]
  );

  return { page, setPage, getParam, setFilter, pushParams, isPending };
}
