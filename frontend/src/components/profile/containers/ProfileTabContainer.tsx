
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Save } from "lucide-react";

interface ProfileTabContainerProps {
  userData: any;
  userId: string | null;
  bio: string;
  setBio: (bio: string) => void;
  experiences: any[];
  setExperiences: (experiences: any[]) => void;
  educations: any[];
  setEducations: (educations: any[]) => void;
  skills: string[];
  setSkills: (skills: string[]) => void;
  teachingSkills: string[];
  upcomingSessions: any[];
  editingBio: boolean;
  setEditingBio: (editing: boolean) => void;
  editingExperience: boolean;
  setEditingExperience: (editing: boolean) => void;
  editingEducation: boolean;
  setEditingEducation: (editing: boolean) => void;
  editingSkills: boolean;
  setEditingSkills: (editing: boolean) => void;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  isOwnProfile: boolean;
}

const ProfileTabContainer: React.FC<ProfileTabContainerProps> = ({
  userData,
  userId,
  bio,
  setBio,
  experiences,
  setExperiences,
  educations,
  setEducations,
  skills,
  setSkills,
  teachingSkills,
  upcomingSessions,
  editingBio,
  setEditingBio,
  editingExperience,
  setEditingExperience,
  editingEducation,
  setEditingEducation,
  editingSkills,
  setEditingSkills,
  newSkill,
  setNewSkill,
  isOwnProfile
}) => {
  const handleBioSave = async () => {
    try {
      // Save bio logic would go here
      setEditingBio(false);
    } catch (error) {
      console.error('Error saving bio:', error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Bio Section */}
      <Card className="col-span-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>About</CardTitle>
          {isOwnProfile && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => editingBio ? handleBioSave() : setEditingBio(true)}
            >
              {editingBio ? (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              ) : (
                <>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingBio ? (
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              className="min-h-[150px]"
            />
          ) : (
            <p className="text-muted-foreground">
              {bio || "No bio information provided yet."}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Additional profile sections would go here */}
      {/* For now, this is a minimal implementation */}
    </div>
  );
};

export default ProfileTabContainer;
