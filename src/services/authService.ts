
// Authentication service
import { supabase } from '@/integrations/supabase/client';
import { APIClient } from '@/api/client';
import { useToast } from '@/hooks/use-toast';

// Define User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  location?: string;
  occupation?: string;
  education?: string;
  avatar?: string;
  headline?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignupData): Promise<void> {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
          }
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },
  
  async login(data: LoginData): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return null;
      
      // Fetch user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError || !profileData) return null;
      
      return {
        id: data.user.id,
        email: data.user.email || '',
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
        updatedAt: profileData.updated_at
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  async isAuthenticated(): Promise<boolean> {
    const { data } = await supabase.auth.getSession();
    return !!data.session;
  },
  
  async googleAuth(): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/calendar',
          redirectTo: `${window.location.origin}/oauth/callback`
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Google auth error:', error);
      throw error;
    }
  }
};
