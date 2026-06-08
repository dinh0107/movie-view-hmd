import { Loader2 } from "lucide-react";

export function PageLoader({ label = "Đang tải..." }: { label?: string }) {
  return (
    <main className="page-shell grid min-h-[50vh] place-items-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </main>
  );
}
