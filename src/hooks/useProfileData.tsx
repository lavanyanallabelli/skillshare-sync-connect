
import { useState, useEffect } from "react";
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

  useEffect(() => {
    const loadUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // First try to load from localStorage
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

        // Then try to load from database
        // Fetch profile data
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
          // Fetch experiences
          const { data: experienceData, error: experienceError } = await supabase
            .from('user_experiences')
            .select('*')
            .eq('user_id', userId);

          // Fetch education
          const { data: educationData, error: educationError } = await supabase
            .from('user_education')
            .select('*')
            .eq('user_id', userId);

          // Fetch teaching skills
          const { data: teachingSkillsData, error: teachingSkillsError } = await supabase
            .from('teaching_skills')
            .select('skill')
            .eq('user_id', userId);

          // Fetch learning skills
          const { data: learningSkillsData, error: learningSkillsError } = await supabase
            .from('learning_skills')
            .select('skill')
            .eq('user_id', userId);

          const formattedExperiences = experienceData ? experienceData.map(exp => ({
            id: exp.id,
            title: exp.position,
            company: exp.company,
            // Fix: Don't access location property as it doesn't exist in the exp object
            location: '',  // Default to empty string
            startDate: exp.start_date,
            endDate: exp.end_date,
            description: exp.description
          })) : [];

          const formattedEducations = educationData ? educationData.map(edu => ({
            id: edu.id,
            school: edu.institution,
            degree: edu.degree,
            field: edu.field_of_study || '',
            startDate: edu.start_date,
            endDate: edu.end_date
          })) : [];

          const formattedTeachingSkills = teachingSkillsData 
            ? teachingSkillsData.map(item => item.skill)
            : [];

          const formattedLearningSkills = learningSkillsData 
            ? learningSkillsData.map(item => item.skill)
            : [];

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
    };

    loadUserData();
  }, [userId]);

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
    error
  };
};
