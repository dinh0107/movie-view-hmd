export function PageBreadcrumb({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-border/60 bg-gradient-to-b from-muted/40 to-transparent">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {subtitle ? (
          <p className="text-sm font-medium text-primary">{subtitle}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
      </div>
    </div>
  );
}
