
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, X, Plus, Save, Briefcase, GraduationCap, AwardIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ProfileAbout from "../sections/ProfileAbout";
import ProfileExperience from "../sections/ProfileExperience";
import ProfileEducation from "../sections/ProfileEducation";
import ProfileSkills from "../sections/ProfileSkills";
import { SessionCard, EmptyState } from "../common/ProfileUIComponents";

interface ProfileTabProps {
  userData: any;
  userId: string | null;
  bio: string;
  setBio: (bio: string) => void;
  editingBio: boolean;
  setEditingBio: (editing: boolean) => void;
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
}

const ProfileTab: React.FC<ProfileTabProps> = ({
  userData,
  userId,
  bio,
  setBio,
  editingBio,
  setEditingBio,
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
  setNewSkill
}) => {
  const { toast } = useToast();

  const handleSaveBio = async () => {
    setEditingBio(false);
    if (userData && userId) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ bio: bio })
          .eq('id', userId);
          
        if (error) throw error;
        
        const updatedUserData = { ...userData, bio };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        
        toast({
          title: "Profile updated",
          description: "Your bio has been updated successfully",
        });
      } catch (error) {
        console.error('Error updating bio:', error);
        toast({
          title: "Error updating bio",
          description: "Failed to update your bio. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const saveExperiences = async () => {
    if (!userId) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('user_experiences')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      if (experiences.length > 0) {
        const experiencesToInsert = experiences.map(exp => ({
          user_id: userId,
          company: exp.company,
          position: exp.title,
          description: exp.description || '',
          start_date: exp.startDate || null,
          end_date: exp.endDate || null,
          current: !exp.endDate
        }));
        
        const { error: insertError } = await supabase
          .from('user_experiences')
          .insert(experiencesToInsert);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Experiences saved",
        description: "Your work experiences have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving experiences:', error);
      toast({
        title: "Error saving experiences",
        description: "Failed to save your experiences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveEducation = async () => {
    if (!userId) return;
    
    try {
      const { error: deleteError } = await supabase
        .from('user_education')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      if (educations.length > 0) {
        const educationsToInsert = educations.map(edu => ({
          user_id: userId,
          institution: edu.school,
          degree: edu.degree,
          field_of_study: edu.field || '',
          start_date: edu.startDate || null,
          end_date: edu.endDate || null,
          current: !edu.endDate
        }));
        
        const { error: insertError } = await supabase
          .from('user_education')
          .insert(educationsToInsert);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Education saved",
        description: "Your education information has been updated successfully",
      });
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: "Error saving education",
        description: "Failed to save your education. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveExperience = () => {
    setEditingExperience(false);
    saveExperiences();
  };

  const handleSaveEducation = () => {
    setEditingEducation(false);
    saveEducation();
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
        handleSaveBio={handleSaveBio}
      />

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <SessionCard key={session.id} session={session} />
              ))
            ) : (
              <EmptyState message="No upcoming sessions" subMessage="Book a session or wait for requests" />
            )}
          </div>
        </CardContent>
      </Card>

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
        skills={skills}
        editingSkills={editingSkills}
        setEditingSkills={setEditingSkills}
        newSkill={newSkill}
        setNewSkill={setNewSkill}
        addSkill={addSkill}
        removeSkill={removeSkill}
      />
    </div>
  );
};

export default ProfileTab;
