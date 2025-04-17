
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ProfileSectionSkeletonProps {
  title?: boolean;
  lines?: number;
  height?: string;
}

const ProfileSectionSkeleton: React.FC<ProfileSectionSkeletonProps> = ({ 
  title = true, 
  lines = 3,
  height = "h-16" 
}) => {
  return (
    <Card>
      <CardHeader>
        {title && <Skeleton className="h-7 w-1/3 rounded-lg" />}
      </CardHeader>
      <CardContent className="space-y-4">
        {Array(lines).fill(0).map((_, i) => (
          <Skeleton key={i} className={`${height} w-full rounded-lg`} />
        ))}
      </CardContent>
    </Card>
  );
};

export default ProfileSectionSkeleton;
