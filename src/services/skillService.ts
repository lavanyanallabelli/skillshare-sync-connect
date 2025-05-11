
// Skill service
import { supabase } from '@/integrations/supabase/client';

interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export const skillService = {
  async getAllSkills(): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills_catalog')
        .select('*')
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting skills:', error);
      return [];
    }
  },
  
  async getSkillCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('skills_catalog')
        .select('category')
        .order('category', { ascending: true });
        
      if (error) throw error;
      
      // Extract unique categories
      const categories = new Set<string>();
      (data || []).forEach(item => categories.add(item.category));
      
      return Array.from(categories);
    } catch (error) {
      console.error('Error getting skill categories:', error);
      return [];
    }
  },
  
  async getSkillsByCategory(category: string): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills_catalog')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error getting skills for category ${category}:`, error);
      return [];
    }
  },
  
  async searchSkills(query: string): Promise<Skill[]> {
    try {
      const { data, error } = await supabase
        .from('skills_catalog')
        .select('*')
        .ilike('name', `%${query}%`)
        .order('name', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error searching skills with query ${query}:`, error);
      return [];
    }
  },
  
  async getTeachingSkills(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('teaching_skills')
        .select('skill')
        .eq('user_id', userId);
        
      if (error) throw error;
      return (data || []).map(item => item.skill);
    } catch (error) {
      console.error('Error getting teaching skills:', error);
      return [];
    }
  },
  
  async getLearningSkills(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('learning_skills')
        .select('skill')
        .eq('user_id', userId);
        
      if (error) throw error;
      return (data || []).map(item => item.skill);
    } catch (error) {
      console.error('Error getting learning skills:', error);
      return [];
    }
  }
};
