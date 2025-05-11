
// User service
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Experience, Education, Skill } from '@/models/User';
import { toast } from '@/hooks/use-toast';

export const userService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Fetch all related data in parallel
      const [
        experienceResponse,
        educationResponse,
        teachingSkillsResponse,
        learningSkillsResponse,
        userEmailResponse
      ] = await Promise.all([
        supabase.from('user_experiences').select('*').eq('user_id', userId),
        supabase.from('user_education').select('*').eq('user_id', userId),
        supabase.from('teaching_skills').select('skill, proficiency_level').eq('user_id', userId),
        supabase.from('learning_skills').select('skill').eq('user_id', userId),
        supabase.rpc('get_user_email', { user_id: userId })
      ]);
      
      // Format experiences
      const formattedExperiences = (experienceResponse.data || []).map(exp => ({
        id: exp.id,
        title: exp.position,
        company: exp.company,
        location: '',
        startDate: exp.start_date,
        endDate: exp.end_date,
        description: exp.description
      }));
      
      // Format educations
      const formattedEducations = (educationResponse.data || []).map(edu => ({
        id: edu.id,
        school: edu.institution,
        degree: edu.degree,
        field: edu.field_of_study || '',
        startDate: edu.start_date,
        endDate: edu.end_date
      }));
      
      // Format skills
      const formattedTeachingSkills = (teachingSkillsResponse.data || []).map(item => ({
        skill: item.skill,
        proficiencyLevel: item.proficiency_level
      }));
      
      const formattedLearningSkills = (learningSkillsResponse.data || []).map(item => ({
        skill: item.skill
      }));
      
      // Create final user profile object
      const userProfile: UserProfile = {
        id: userId,
        email: userEmailResponse.data || '',
        firstName: profileData.first_name || '',
        lastName: profileData.last_name || '',
        bio: profileData.bio || '',
        location: profileData.location || '',
        occupation: profileData.occupation || '',
        education: profileData.education || '',
        avatar: profileData.avatar_url || '',
        headline: profileData.headline || '',
        website: profileData.website || '',
        linkedin: profileData.linkedin || '',
        github: profileData.github || '',
        twitter: profileData.twitter || '',
        createdAt: profileData.created_at,
        updatedAt: profileData.updated_at,
        experiences: formattedExperiences,
        educations: formattedEducations,
        teachingSkills: formattedTeachingSkills,
        learningSkills: formattedLearningSkills
      };
      
      return userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  },
  
  async updateProfile(userId: string, profileData: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          bio: profileData.bio,
          location: profileData.location,
          occupation: profileData.occupation,
          education: profileData.education,
          headline: profileData.headline,
          website: profileData.website,
          linkedin: profileData.linkedin,
          github: profileData.github,
          twitter: profileData.twitter,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ 
        title: 'Update failed', 
        description: error.message || 'Could not update profile',
        variant: 'destructive' 
      });
      return false;
    }
  },
  
  async saveExperiences(userId: string, experiences: Experience[]): Promise<boolean> {
    try {
      // Get current experiences to compare
      const { data: currentExperiences } = await supabase
        .from('user_experiences')
        .select('id')
        .eq('user_id', userId);
      
      const currentIds = new Set((currentExperiences || []).map(exp => exp.id));
      const newExperienceIds = new Set(experiences.map(exp => exp.id));
      
      // Find experiences to delete
      const idsToDelete = [...currentIds].filter(id => !newExperienceIds.has(id));
      
      // Delete removed experiences
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_experiences')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) throw deleteError;
      }
      
      // Update or insert experiences
      for (const exp of experiences) {
        const formattedExperience = {
          id: exp.id,
          user_id: userId,
          company: exp.company,
          position: exp.title,
          description: exp.description || '',
          start_date: exp.startDate,
          end_date: exp.endDate || null,
          current: !exp.endDate,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('user_experiences')
          .upsert(formattedExperience, { onConflict: 'id' });
          
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving experiences:', error);
      toast({ 
        title: 'Update failed', 
        description: error.message || 'Could not save experiences',
        variant: 'destructive' 
      });
      return false;
    }
  },
  
  async saveEducation(userId: string, educations: Education[]): Promise<boolean> {
    try {
      // Get current education records to compare
      const { data: currentEducation } = await supabase
        .from('user_education')
        .select('id')
        .eq('user_id', userId);
      
      const currentIds = new Set((currentEducation || []).map(edu => edu.id));
      const newEducationIds = new Set(educations.map(edu => edu.id));
      
      // Find education records to delete
      const idsToDelete = [...currentIds].filter(id => !newEducationIds.has(id));
      
      // Delete removed education records
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('user_education')
          .delete()
          .in('id', idsToDelete);
          
        if (deleteError) throw deleteError;
      }
      
      // Update or insert education records
      for (const edu of educations) {
        const formattedEducation = {
          id: edu.id,
          user_id: userId,
          institution: edu.school,
          degree: edu.degree,
          field_of_study: edu.field || '',
          start_date: edu.startDate,
          end_date: edu.endDate || null,
          current: !edu.endDate,
          updated_at: new Date().toISOString()
        };
        
        const { error } = await supabase
          .from('user_education')
          .upsert(formattedEducation, { onConflict: 'id' });
          
        if (error) throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving education:', error);
      toast({ 
        title: 'Update failed', 
        description: error.message || 'Could not save education',
        variant: 'destructive' 
      });
      return false;
    }
  },
  
  async saveSkills(userId: string, skills: string[]): Promise<boolean> {
    try {
      // First delete existing skills
      await supabase
        .from('teaching_skills')
        .delete()
        .eq('user_id', userId);
        
      // Then insert new skills
      const skillsToInsert = skills.map(skill => ({
        user_id: userId,
        skill,
        proficiency_level: 'Intermediate',
      }));
      
      const { error } = await supabase
        .from('teaching_skills')
        .insert(skillsToInsert);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving skills:', error);
      toast({ 
        title: 'Update failed', 
        description: error.message || 'Could not save skills',
        variant: 'destructive' 
      });
      return false;
    }
  },
  
  async saveLearningSkills(userId: string, skills: string[]): Promise<boolean> {
    try {
      // First delete existing learning skills
      await supabase
        .from('learning_skills')
        .delete()
        .eq('user_id', userId);
        
      // Then insert new learning skills
      const skillsToInsert = skills.map(skill => ({
        user_id: userId,
        skill,
      }));
      
      const { error } = await supabase
        .from('learning_skills')
        .insert(skillsToInsert);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving learning skills:', error);
      toast({ 
        title: 'Update failed', 
        description: error.message || 'Could not save learning skills',
        variant: 'destructive' 
      });
      return false;
    }
  }
};
