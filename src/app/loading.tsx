import { ProductGridSkeleton, Skeleton } from "@/components/ui/Primitives";

export default function Loading() {
  return (
    <div className="container-page py-12">
      <div className="space-y-4">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-3 w-full max-w-lg" />
      </div>
      <div className="mt-12">
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
