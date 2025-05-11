
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Pencil } from 'lucide-react';

export interface ProfileSkillsProps {
  skills: string[];
  setSkills: (skills: string[]) => void;
  editingSkills: boolean;
  setEditingSkills: (editing: boolean) => void;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  isEditable: boolean;
}

const ProfileSkills: React.FC<ProfileSkillsProps> = ({
  skills,
  setSkills,
  editingSkills,
  setEditingSkills,
  newSkill,
  setNewSkill,
  isEditable,
}) => {
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Skills</h3>
          {isEditable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingSkills(!editingSkills)}
            >
              {editingSkills ? 'Done' : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
        </div>
        
        {editingSkills && (
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button onClick={handleAddSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        )}

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {skill}
                {editingSkills && (
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveSkill(skill)}
                  />
                )}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No skills added yet.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileSkills;
