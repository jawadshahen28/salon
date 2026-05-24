export function SkeletonCard() {
  return (
    <div className="glass-card space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded-full bg-white/8 shimmer" />
        <div className="h-11 w-11 rounded-2xl bg-white/8 shimmer" />
      </div>
      <div className="h-8 w-32 rounded-xl bg-white/8 shimmer" />
      <div className="h-3 w-24 rounded-full bg-white/8 shimmer" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="glass-card flex items-center gap-4 p-4">
      <div className="h-12 w-12 rounded-2xl bg-white/8 shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-36 rounded-full bg-white/8 shimmer" />
        <div className="h-3 w-24 rounded-full bg-white/8 shimmer" />
      </div>
      <div className="h-8 w-20 rounded-xl bg-white/8 shimmer" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6">
      <div className="mb-6 h-4 w-32 rounded-full bg-white/8 shimmer" />
      <div className="flex items-end gap-3 h-40">
        {[60, 80, 40, 90, 70, 85, 55].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-2xl bg-white/8 shimmer"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
