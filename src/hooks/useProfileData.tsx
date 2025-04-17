
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  occupation: string;
  education: string;
  teachingSkills: string[];
  learningSkills: string[];
  avatar: string;
  createdAt: string;
  experiences?: { id: string; title: string; company: string; startDate: string; endDate?: string; location?: string; description?: string }[];
  educations?: { id: string; school: string; degree: string; field: string; startDate: string; endDate?: string }[];
  skills?: string[];
  headline?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

export const useProfileData = (userId: string | null) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [experiences, setExperiences] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<string[]>([]);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize the refreshUserData function to prevent unnecessary re-renders
  const refreshUserData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // First try to load from localStorage for instant UI feedback
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const parsedData = JSON.parse(storedUserData) as UserData;
        setUserData(parsedData);
        setExperiences(parsedData.experiences || []);
        setEducations(parsedData.educations || []);
        setSkills(parsedData.skills || []);
        setTeachingSkills(parsedData.teachingSkills || []);
        setLearningSkills(parsedData.learningSkills || []);
      }

      // Then fetch latest data from the database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        if (!storedUserData) {
          setError('Failed to load profile data');
        }
      } else if (profileData) {
        // Fetch all related data in parallel for better performance
        const [
          experienceResponse,
          educationResponse,
          teachingSkillsResponse,
          learningSkillsResponse
        ] = await Promise.all([
          supabase.from('user_experiences').select('*').eq('user_id', userId),
          supabase.from('user_education').select('*').eq('user_id', userId),
          supabase.from('teaching_skills').select('skill, proficiency_level').eq('user_id', userId),
          supabase.from('learning_skills').select('skill').eq('user_id', userId)
        ]);

        const experienceData = experienceResponse.data || [];
        const educationData = educationResponse.data || [];
        const teachingSkillsData = teachingSkillsResponse.data || [];
        const learningSkillsData = learningSkillsResponse.data || [];

        // Check for errors
        if (experienceResponse.error) console.error("Error fetching experiences:", experienceResponse.error);
        if (educationResponse.error) console.error("Error fetching education:", educationResponse.error);
        if (teachingSkillsResponse.error) console.error("Error fetching teaching skills:", teachingSkillsResponse.error);
        if (learningSkillsResponse.error) console.error("Error fetching learning skills:", learningSkillsResponse.error);

        const formattedExperiences = experienceData.map(exp => ({
          id: exp.id,
          title: exp.position,
          company: exp.company,
          location: '',  // Default to empty string
          startDate: exp.start_date,
          endDate: exp.end_date,
          description: exp.description
        }));

        const formattedEducations = educationData.map(edu => ({
          id: edu.id,
          school: edu.institution,
          degree: edu.degree,
          field: edu.field_of_study || '',
          startDate: edu.start_date,
          endDate: edu.end_date
        }));

        const formattedTeachingSkills = teachingSkillsData.map(item => item.skill);
        const formattedLearningSkills = learningSkillsData.map(item => item.skill);

        const updatedUserData: UserData = {
          id: userId,
          firstName: profileData.first_name || '',
          lastName: profileData.last_name || '',
          email: '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          occupation: profileData.occupation || '',
          education: profileData.education || '',
          teachingSkills: formattedTeachingSkills,
          learningSkills: formattedLearningSkills,
          avatar: profileData.avatar_url || '',
          createdAt: profileData.created_at,
          experiences: formattedExperiences,
          educations: formattedEducations,
          skills: [...formattedTeachingSkills, ...formattedLearningSkills],
          headline: profileData.headline || '',
          website: profileData.website || '',
          linkedin: profileData.linkedin || '',
          github: profileData.github || '',
          twitter: profileData.twitter || ''
        };

        setUserData(updatedUserData);
        setExperiences(formattedExperiences);
        setEducations(formattedEducations);
        setSkills([...formattedTeachingSkills, ...formattedLearningSkills]);
        setTeachingSkills(formattedTeachingSkills);
        setLearningSkills(formattedLearningSkills);

        // Update localStorage
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      }
    } catch (err) {
      console.error('Error in loadUserData:', err);
      setError('An unexpected error occurred while loading profile data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refreshUserData();
  }, [refreshUserData]);

  return {
    userData,
    setUserData,
    experiences,
    setExperiences,
    educations,
    setEducations,
    skills,
    setSkills,
    teachingSkills,
    setTeachingSkills,
    learningSkills,
    setLearningSkills,
    loading,
    error,
    refreshUserData
  };
};
