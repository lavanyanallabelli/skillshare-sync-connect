
// Authentication service
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/models/User';
import { APIClient } from '@/api/client';
import { API_ENDPOINTS } from '@/api/config';
import { toast } from '@/hooks/use-toast';

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
      toast({ 
        title: 'Signup failed', 
        description: error.message || 'Could not create account',
        variant: 'destructive' 
      });
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
      toast({ 
        title: 'Login failed', 
        description: error.message || 'Invalid credentials',
        variant: 'destructive' 
      });
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
      toast({ 
        title: 'Logout failed', 
        description: error.message || 'Could not sign out',
        variant: 'destructive' 
      });
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
      toast({ 
        title: 'Google login failed', 
        description: error.message || 'Could not authorize with Google',
        variant: 'destructive' 
      });
      throw error;
    }
  }
};
