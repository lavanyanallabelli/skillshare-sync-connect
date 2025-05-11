
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ProfileBio } from '../common/ProfileUIComponents';
import ProfileExperience from '../sections/ProfileExperience';
import ProfileSkills from '../sections/ProfileSkills';

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
  return (
    <div className="space-y-6">
      {/* Bio Section */}
      <Card>
        <CardContent className="pt-6">
          <ProfileBio
            bio={bio}
            editing={editingBio}
            onEdit={() => setEditingBio(true)}
            onSave={(newBio) => {
              setBio(newBio);
              setEditingBio(false);
            }}
            onCancel={() => setEditingBio(false)}
            isEditable={isOwnProfile}
          />
        </CardContent>
      </Card>

      {/* Experience Section */}
      <ProfileExperience
        experiences={experiences}
        setExperiences={setExperiences}
        editing={editingExperience}
        setEditing={setEditingExperience}
        isEditable={isOwnProfile}
      />

      {/* Education Section */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-semibold mb-4">Education</h3>
          {educations.length > 0 ? (
            <div className="space-y-4">
              {educations.map((edu, index) => (
                <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <p className="text-sm text-muted-foreground">{edu.institution}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.startYear} - {edu.endYear || 'Present'}
                  </p>
                  {edu.description && (
                    <p className="text-sm mt-2">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No education information added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <ProfileSkills
        skills={skills}
        setSkills={setSkills}
        editingSkills={editingSkills}
        setEditingSkills={setEditingSkills}
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        isEditable={isOwnProfile}
      />

      {/* Teaching Skills Section */}
      {teachingSkills.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Teaching Skills</h3>
            <div className="flex flex-wrap gap-2">
              {teachingSkills.map((skill, index) => (
                <div
                  key={index}
                  className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm"
                >
                  {skill}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProfileTabContainer;
