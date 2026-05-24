export function SkeletonCard() {
  return (
    <div className="glass-card p-6 space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-white/5 rounded-lg shimmer" />
        <div className="w-10 h-10 bg-white/5 rounded-xl shimmer" />
      </div>
      <div className="h-8 w-32 bg-white/5 rounded-lg shimmer" />
      <div className="h-3 w-20 bg-white/5 rounded-lg shimmer" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="glass-card p-4 flex items-center gap-4">
      <div className="w-10 h-10 bg-white/5 rounded-full shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-white/5 rounded shimmer" />
        <div className="h-3 w-24 bg-white/5 rounded shimmer" />
      </div>
      <div className="h-6 w-16 bg-white/5 rounded-lg shimmer" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6">
      <div className="h-4 w-32 bg-white/5 rounded-lg shimmer mb-6" />
      <div className="flex items-end gap-3 h-40">
        {[60, 80, 40, 90, 70, 85, 55].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-white/5 rounded-t-lg shimmer"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}
