import React from "react";
import { Skeleton } from "./skeleton";
import { Loader2 } from "lucide-react";

export function SkeletonCard() {
  return (
    <div className="stat-card">
      <div className="flex items-start gap-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 max-w-[60%] mb-2" />
          <Skeleton className="h-3 max-w-[40%]" />
        </div>
      </div>

      <div className="mt-4">
        <Skeleton className="h-24 w-full rounded" />
      </div>
    </div>
  );
}

export function LoaderIcon({ className = "w-4 h-4" }: { className?: string }) {
  return <Loader2 className={`${className} animate-spin`} />;
}

export default SkeletonCard;
