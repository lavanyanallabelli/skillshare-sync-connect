
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingFallbackProps {
  count?: number;
  height?: string;
  className?: string;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  count = 3, 
  height = "h-20", 
  className = "w-full" 
}) => {
  return (
    <div className="space-y-4">
      {Array(count).fill(0).map((_, i) => (
        <Skeleton key={i} className={`${height} ${className} rounded-lg`} />
      ))}
    </div>
  );
};

export default LoadingFallback;
