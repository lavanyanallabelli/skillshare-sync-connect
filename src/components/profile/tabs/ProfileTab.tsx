
import React from "react";
import ProfileTabContainer from "../containers/ProfileTabContainer";

interface ProfileTabProps {
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
  upcomingSessions: any[];
  editingExperience: boolean;
  setEditingExperience: (editing: boolean) => void;
  editingEducation: boolean;
  setEditingEducation: (editing: boolean) => void;
  editingSkills: boolean;
  setEditingSkills: (editing: boolean) => void;
  newSkill: string;
  setNewSkill: (skill: string) => void;
  editingBio: boolean;
  setEditingBio: (editing: boolean) => void;
}

const ProfileTab: React.FC<ProfileTabProps> = ({
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
  upcomingSessions,
  editingExperience,
  setEditingExperience,
  editingEducation,
  setEditingEducation,
  editingSkills,
  setEditingSkills,
  newSkill,
  setNewSkill,
  editingBio,
  setEditingBio
}) => {
  return (
    <ProfileTabContainer
      userData={userData}
      userId={userId}
      bio={bio}
      setBio={setBio}
      experiences={experiences}
      setExperiences={setExperiences}
      educations={educations}
      setEducations={setEducations}
      skills={skills}
      setSkills={setSkills}
      upcomingSessions={upcomingSessions}
      editingBio={editingBio}
      setEditingBio={setEditingBio}
      editingExperience={editingExperience}
      setEditingExperience={setEditingExperience}
      editingEducation={editingEducation}
      setEditingEducation={setEditingEducation}
      editingSkills={editingSkills}
      setEditingSkills={setEditingSkills}
      newSkill={newSkill}
      setNewSkill={setNewSkill}
    />
  );
};

export default ProfileTab;
