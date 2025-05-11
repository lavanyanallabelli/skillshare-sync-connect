
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderAchievementsProps {
  achievements: string[];
}

const ProfileHeaderAchievements: React.FC<ProfileHeaderAchievementsProps> = ({ achievements }) => {
  if (!achievements || achievements.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {achievements.map((achievement, index) => (
        <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/20">
          {achievement}
        </Badge>
      ))}
    </div>
  );
};

export default ProfileHeaderAchievements;
