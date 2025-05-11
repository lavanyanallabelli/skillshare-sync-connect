
import React from 'react';
import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProfileHeaderAchievementsProps {
  achievements: string[];
}

const ProfileHeaderAchievements: React.FC<ProfileHeaderAchievementsProps> = ({ achievements }) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-2">Achievements</h3>
      <div className="flex flex-wrap gap-2">
        {achievements.map((achievement, index) => (
          <Badge key={index} variant="outline" className="flex items-center gap-1">
            <Award className="h-3 w-3" /> {achievement}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default ProfileHeaderAchievements;
