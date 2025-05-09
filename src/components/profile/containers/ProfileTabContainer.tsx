
import React from "react";
import { useSaveProfileData } from "../actions/ProfileSaveActions";
import ProfileAbout from "../sections/ProfileAbout";
import ProfileExperience from "../sections/ProfileExperience";
import ProfileEducation from "../sections/ProfileEducation";
import ProfileSkills from "../sections/ProfileSkills";
import ProfileUpcomingSessions from "./ProfileUpcomingSessions";

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
  setNewSkill
}) => {
  const { 
    handleSaveBio, 
    saveExperiences, 
    saveEducation,
    saveSkills 
  } = useSaveProfileData({ userId, userData });

  const handleBioSave = async () => {
    const success = await handleSaveBio(bio);
    if (success) {
      setEditingBio(false);
    }
  };

  const handleSaveExperience = async () => {
    const success = await saveExperiences(experiences);
    if (success) {
      setEditingExperience(false);
    }
  };

  const handleSaveEducation = async () => {
    const success = await saveEducation(educations);
    if (success) {
      setEditingEducation(false);
    }
  };

  const handleSaveSkills = async () => {
    const success = await saveSkills(skills);
    if (success) {
      setEditingSkills(false);
    }
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: ""
      }
    ]);
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: ""
      }
    ]);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    setExperiences(newExperiences);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducations = [...educations];
    newEducations[index] = {
      ...newEducations[index],
      [field]: value
    };
    setEducations(newEducations);
  };

  const removeExperience = (index: number) => {
    const newExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(newExperiences);
  };

  const removeEducation = (index: number) => {
    const newEducations = educations.filter((_, i) => i !== index);
    setEducations(newEducations);
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <ProfileAbout 
        bio={bio}
        editingBio={editingBio}
        setBio={setBio}
        setEditingBio={setEditingBio}
        handleSaveBio={handleBioSave}
      />

      <ProfileUpcomingSessions upcomingSessions={upcomingSessions} />

      <ProfileExperience
        experiences={experiences}
        editingExperience={editingExperience}
        setEditingExperience={setEditingExperience}
        addExperience={addExperience}
        updateExperience={updateExperience}
        removeExperience={removeExperience}
        handleSaveExperience={handleSaveExperience}
      />

      <ProfileEducation 
        educations={educations}
        editingEducation={editingEducation}
        setEditingEducation={setEditingEducation}
        addEducation={addEducation}
        updateEducation={updateEducation}
        removeEducation={removeEducation}
        handleSaveEducation={handleSaveEducation}
      />

      <ProfileSkills 
        skills={teachingSkills.length > 0 ? teachingSkills : skills}
        editingSkills={editingSkills}
        setEditingSkills={setEditingSkills}
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        addSkill={addSkill}
        removeSkill={removeSkill}
        handleSaveSkills={handleSaveSkills}
        isTeachingSkill={true}
      />
    </div>
  );
};

export default ProfileTabContainer;
