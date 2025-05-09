
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileSaveActionsProps {
  userId: string | null;
  userData: any;
}

export const useSaveProfileData = ({ userId, userData }: ProfileSaveActionsProps) => {
  const { toast } = useToast();

  const handleSaveBio = async (bio: string) => {
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

        return true;
      } catch (error) {
        console.error('Error updating bio:', error);
        toast({
          title: "Error updating bio",
          description: "Failed to update your bio. Please try again.",
          variant: "destructive",
        });
        return false;
      }
    }
    return false;
  };

  const saveExperiences = async (experiences: any[]) => {
    if (!userId) return false;
    
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
      
      return true;
    } catch (error) {
      console.error('Error saving experiences:', error);
      toast({
        title: "Error saving experiences",
        description: "Failed to save your experiences. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveEducation = async (educations: any[]) => {
    if (!userId) return false;
    
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
      
      return true;
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: "Error saving education",
        description: "Failed to save your education. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveSkills = async (skills: string[]) => {
    if (!userId) return false;
    
    try {
      // First, delete all existing teaching skills for this user
      const { error: deleteError } = await supabase
        .from('teaching_skills')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Then insert the current skills
      if (skills.length > 0) {
        const skillsToInsert = skills.map(skill => ({
          user_id: userId,
          skill,
          proficiency_level: 'Intermediate' // Default level
        }));
        
        const { error: insertError } = await supabase
          .from('teaching_skills')
          .insert(skillsToInsert);
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Skills saved",
        description: "Your teaching skills have been updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error saving skills:', error);
      toast({
        title: "Error saving skills",
        description: "Failed to save your skills. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleSaveBio,
    saveExperiences,
    saveEducation,
    saveSkills
  };
};
