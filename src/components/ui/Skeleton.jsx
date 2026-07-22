export function Skeleton({ className, ...props }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-2/60 border border-border/40 ${className}`}
      {...props}
    />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm">
      {/* Top row: badge + time */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-12 h-3.5 rounded-md" />
      </div>

      {/* Collab label */}
      <div className="flex flex-col gap-1.5 mt-1">
        <Skeleton className="w-24 h-3 rounded-md" />
        <Skeleton className="w-32 h-4 rounded-md" />
      </div>

      {/* Title */}
      <Skeleton className="w-full h-5 rounded-md" />

      {/* Description lines */}
      <div className="flex flex-col gap-1.5 mt-1">
        <Skeleton className="w-full h-3.5 rounded-md" />
        <Skeleton className="w-[85%] h-3.5 rounded-md" />
      </div>

      {/* Tech tags */}
      <div className="flex gap-1.5 mt-2">
        <Skeleton className="w-14 h-5 rounded-md" />
        <Skeleton className="w-16 h-5 rounded-md" />
        <Skeleton className="w-12 h-5 rounded-md" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 mt-auto pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="w-16 h-3 rounded-md" />
        </div>
        <div className="flex-1" />
        <Skeleton className="w-10 h-3 rounded-md" />
        <Skeleton className="w-14 h-7 rounded-lg" />
      </div>
    </div>
  );
}

export function WorkspaceCardSkeleton() {
  return (
    <div className="flex flex-col justify-between gap-6 p-6 rounded-2xl border border-border bg-card shadow-sm min-h-[220px]">
      <div>
        {/* Icon container */}
        <Skeleton className="w-11 h-11 rounded-xl mb-5" />
        {/* Title */}
        <Skeleton className="w-3/4 h-5 rounded-md mb-3" />
        {/* Role pills */}
        <div className="flex gap-2">
          <Skeleton className="w-14 h-5 rounded-full" />
          <Skeleton className="w-16 h-5 rounded-full" />
        </div>
      </div>
      {/* Bottom CTA */}
      <div className="flex items-end justify-between pt-1">
        <Skeleton className="w-24 h-4 rounded-md" />
        <Skeleton className="w-9 h-9 rounded-full" />
      </div>
    </div>
  );
}
