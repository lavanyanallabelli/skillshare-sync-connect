
import React from "react";
import { Badge } from "@/components/ui/badge";

interface ProfileHeaderSkillsProps {
  teachingSkills: string[];
  learningSkills: string[];
}

const ProfileHeaderSkills: React.FC<ProfileHeaderSkillsProps> = ({ teachingSkills, learningSkills }) => {
  if (teachingSkills.length === 0 && learningSkills.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      {teachingSkills && teachingSkills.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Skills I Teach</h3>
          <div className="flex flex-wrap gap-2">
            {teachingSkills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {learningSkills && learningSkills.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Skills I Want to Learn</h3>
          <div className="flex flex-wrap gap-2">
            {learningSkills.map((skill, index) => (
              <Badge key={index} variant="outline">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeaderSkills;
