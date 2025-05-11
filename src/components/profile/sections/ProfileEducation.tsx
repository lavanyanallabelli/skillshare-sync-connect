
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Plus, X, GraduationCap } from "lucide-react";

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

interface ProfileEducationProps {
  educations: Education[];
  editingEducation: boolean;
  setEditingEducation: (editing: boolean) => void;
  addEducation: () => void;
  updateEducation: (index: number, field: string, value: string) => void;
  removeEducation: (index: number) => void;
  handleSaveEducation: () => void;
}

const ProfileEducation: React.FC<ProfileEducationProps> = ({
  educations,
  editingEducation,
  setEditingEducation,
  addEducation,
  updateEducation,
  removeEducation,
  handleSaveEducation
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Education
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingEducation(!editingEducation)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editingEducation ? (
          <div className="space-y-4">
            {educations.map((edu, index) => (
              <div key={edu.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Education {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEducation(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label>School</Label>
                  <Input
                    value={edu.school}
                    onChange={(e) => updateEducation(index, "school", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Degree</Label>
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(index, "degree", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Field of Study</Label>
                  <Input
                    value={edu.field}
                    onChange={(e) => updateEducation(index, "field", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={addEducation}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Education
            </Button>
            <Button
              onClick={handleSaveEducation}
              className="w-full mt-2"
            >
              Save Education
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {educations.length > 0 ? (
              educations.map((edu) => (
                <div key={edu.id} className="border-l-2 border-skill-purple pl-4">
                  <h4 className="font-medium">{edu.school}</h4>
                  <p className="text-sm text-muted-foreground">{edu.degree} in {edu.field}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.startDate} - {edu.endDate || 'Present'}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No education added yet</p>
                <p className="text-sm mt-2">Add your educational background to showcase your qualifications</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileEducation;
