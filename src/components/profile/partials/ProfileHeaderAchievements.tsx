
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Award, CheckCircle } from "lucide-react";

interface ProfileHeaderAchievementsProps {
  achievements: string[];
}

const ProfileHeaderAchievements: React.FC<ProfileHeaderAchievementsProps> = ({ achievements }) => {
  if (achievements.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Achievements</h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {achievement.includes("Top") ? (
              <Award className="h-3 w-3" />
            ) : (
              <CheckCircle className="h-3 w-3" />
            )}
            {achievement}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeaderAchievements;
