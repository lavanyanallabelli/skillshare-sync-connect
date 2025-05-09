
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, X, AwardIcon } from "lucide-react";

interface ProfileSkillsProps {
  skills: string[];
  editingSkills: boolean;
  setEditingSkills: (editing: boolean) => void;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  addSkill: () => void;
  removeSkill: (index: number) => void;
  isTeachingSkill?: boolean;
}

const ProfileSkills: React.FC<ProfileSkillsProps> = ({
  skills,
  editingSkills,
  setEditingSkills,
  newSkill,
  setNewSkill,
  addSkill,
  removeSkill,
  isTeachingSkill = true
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <AwardIcon className="h-5 w-5" />
            {isTeachingSkill ? "Skills I Teach" : "Skills"}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingSkills(!editingSkills)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editingSkills ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  <button
                    onClick={() => removeSkill(index)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={`Add a ${isTeachingSkill ? "teaching skill" : "skill"}`}
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSkill.trim()) {
                    addSkill();
                  }
                }}
              />
              <Button onClick={addSkill}>
                Add
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No {isTeachingSkill ? "teaching skills" : "skills"} added yet</p>
                <p className="text-sm mt-2">Add {isTeachingSkill ? "skills you can teach" : "your skills"} to showcase your expertise</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSkills;
