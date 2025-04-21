
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
const TabLoadingPlaceholder = () => (
  <div className="space-y-4">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-20 w-full" />
    <Skeleton className="h-60 w-full" />
  </div>
);
export default TabLoadingPlaceholder;
