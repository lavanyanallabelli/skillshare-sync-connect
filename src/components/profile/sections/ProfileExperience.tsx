
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "../common/ProfileUIComponents";

export interface ProfileExperienceProps {
  experiences: any[];
  setExperiences: (experiences: any[]) => void;
  editing: boolean;
  setEditing: (editing: boolean) => void;
  isEditable: boolean;
}

const ProfileExperience: React.FC<ProfileExperienceProps> = ({
  experiences,
  setExperiences,
  editing,
  setEditing,
  isEditable,
}) => {
  const [newExperience, setNewExperience] = useState({
    id: "",
    title: "",
    company: "",
    startYear: "",
    endYear: "",
    description: "",
  });

  const handleAddExperience = () => {
    if (newExperience.title && newExperience.company) {
      setExperiences([
        ...experiences,
        {
          ...newExperience,
          id: crypto.randomUUID(),
        },
      ]);
      setNewExperience({
        id: "",
        title: "",
        company: "",
        startYear: "",
        endYear: "",
        description: "",
      });
      setEditing(false);
    }
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    const updatedExperiences = [...experiences];
    updatedExperiences[index] = {
      ...updatedExperiences[index],
      [field]: value,
    };
    setExperiences(updatedExperiences);
  };

  const handleDeleteExperience = (index: number) => {
    const updatedExperiences = [...experiences];
    updatedExperiences.splice(index, 1);
    setExperiences(updatedExperiences);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">Experience</h3>
        {isEditable && !editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Experience
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4 border p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newExperience.title}
                  onChange={(e) =>
                    setNewExperience({ ...newExperience, title: e.target.value })
                  }
                  placeholder="e.g., Software Developer"
                />
              </div>
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={newExperience.company}
                  onChange={(e) =>
                    setNewExperience({ ...newExperience, company: e.target.value })
                  }
                  placeholder="e.g., Acme Corp"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startYear">Start Year</Label>
                <Input
                  id="startYear"
                  value={newExperience.startYear}
                  onChange={(e) =>
                    setNewExperience({ ...newExperience, startYear: e.target.value })
                  }
                  placeholder="e.g., 2020"
                />
              </div>
              <div>
                <Label htmlFor="endYear">End Year</Label>
                <Input
                  id="endYear"
                  value={newExperience.endYear}
                  onChange={(e) =>
                    setNewExperience({ ...newExperience, endYear: e.target.value })
                  }
                  placeholder="e.g., 2023 (or leave blank for present)"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newExperience.description}
                onChange={(e) =>
                  setNewExperience({ ...newExperience, description: e.target.value })
                }
                placeholder="Briefly describe your role and achievements"
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false);
                  setNewExperience({
                    id: "",
                    title: "",
                    company: "",
                    startYear: "",
                    endYear: "",
                    description: "",
                  });
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button onClick={handleAddExperience}>
                <Save className="h-4 w-4 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {experiences.length > 0 ? (
              experiences.map((exp, index) => (
                <div
                  key={exp.id || index}
                  className="border-b pb-4 last:border-0 last:pb-0"
                >
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium">{exp.title}</h4>
                      <p className="text-sm text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.startYear} - {exp.endYear || "Present"}
                      </p>
                    </div>
                    {isEditable && (
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setNewExperience(exp);
                            setEditing(true);
                          }}
                        >
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteExperience(index)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    )}
                  </div>
                  {exp.description && (
                    <p className="text-sm mt-2">{exp.description}</p>
                  )}
                </div>
              ))
            ) : (
              <EmptyState 
                message="No experience added yet" 
                subMessage={isEditable ? "Add your work experience to showcase your career" : "This user hasn't added any work experience yet"}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileExperience;
