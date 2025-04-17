
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, X, Briefcase } from "lucide-react";

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface ProfileExperienceProps {
  experiences: Experience[];
  editingExperience: boolean;
  setEditingExperience: (editing: boolean) => void;
  addExperience: () => void;
  updateExperience: (index: number, field: string, value: string) => void;
  removeExperience: (index: number) => void;
  handleSaveExperience: () => void;
}

const ProfileExperience: React.FC<ProfileExperienceProps> = ({
  experiences,
  editingExperience,
  setEditingExperience,
  addExperience,
  updateExperience,
  removeExperience,
  handleSaveExperience
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Experience
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditingExperience(!editingExperience)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {editingExperience ? (
          <div className="space-y-4">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Experience {index + 1}</h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExperience(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-2">
                  <Label>Title</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(index, "title", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Company</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, "company", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input
                    value={exp.location}
                    onChange={(e) => updateExperience(index, "location", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(index, "description", e.target.value)}
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full"
              onClick={addExperience}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
            <Button
              onClick={handleSaveExperience}
              className="w-full mt-2"
            >
              Save Experience
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {experiences.length > 0 ? (
              experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-skill-purple pl-4">
                  <h4 className="font-medium">{exp.title}</h4>
                  <p className="text-sm text-muted-foreground">{exp.company}</p>
                  <p className="text-sm text-muted-foreground">
                    {exp.startDate} - {exp.endDate || 'Present'} • {exp.location}
                  </p>
                  {exp.description && (
                    <p className="text-sm mt-2">{exp.description}</p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No experience added yet</p>
                <p className="text-sm mt-2">Add your work experience to showcase your expertise</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileExperience;
