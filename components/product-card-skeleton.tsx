import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4">
        <Skeleton className="mb-2 h-5 w-20 rounded-full" />
        <Skeleton className="mb-1 h-4 w-full" />
        <Skeleton className="mb-4 h-4 w-2/3" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-7 w-20 rounded-md" />
        </div>
      </div>
    </div>
  )
}
