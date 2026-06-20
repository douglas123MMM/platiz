interface Props { className?: string; }

export default function Skeleton({ className = '' }: Props) {
  return <div className={`animate-pulse bg-white/[0.05] rounded-lg ${className}`} />;
}

export function SkeletonCard({ className = '' }: Props) {
  return (
    <div className={`animate-pulse bg-white/[0.05] rounded-xl ${className}`}>
      <div className="h-40 bg-white/[0.08] rounded-t-xl" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-white/[0.08] rounded w-3/4" />
        <div className="h-3 bg-white/[0.08] rounded w-1/2" />
        <div className="h-3 bg-white/[0.08] rounded w-full" />
      </div>
    </div>
  );
}

export function SkeletonText({ className = '' }: Props) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      <div className="h-4 bg-white/[0.05] rounded w-full" />
      <div className="h-4 bg-white/[0.05] rounded w-5/6" />
      <div className="h-4 bg-white/[0.05] rounded w-4/6" />
    </div>
  );
}

export function SkeletonAvatar({ className = '' }: Props) {
  return (
    <div className={`flex items-center gap-3 animate-pulse ${className}`}>
      <div className="w-10 h-10 bg-white/[0.05] rounded-full" />
      <div className="space-y-2 flex-1">
        <div className="h-3 bg-white/[0.05] rounded w-24" />
        <div className="h-2 bg-white/[0.05] rounded w-16" />
      </div>
    </div>
  );
}
