import { supabase } from "@/integrations/supabase/client";
import { API_BASE_URL, API_ENDPOINTS } from "@/api/config";
import axios from "axios";

const authService = {
  async register(email: string, password: string): Promise<any> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message || 'Registration failed');
      }

      return data;
    } catch (error: any) {
      console.error("Registration failed:", error.message);
      throw error;
    }
  },

  async login(email: string, password: string): Promise<any> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message || 'Login failed');
      }

      return data;
    } catch (error: any) {
      console.error("Login failed:", error.message);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw new Error(error.message || 'Logout failed');
      }
    } catch (error: any) {
      console.error("Logout failed:", error.message);
      throw error;
    }
  },

  async getCurrentUser(): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      return session?.user ?? null;
    } catch (error: any) {
      console.error("Failed to get current user:", error.message);
      return null;
    }
  },

  async resetPassword(email: string): Promise<any> {
     try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        throw new Error(error.message || 'Failed to send reset password email');
      }

      return data;
    } catch (error: any) {
      console.error("Failed to send reset password email:", error.message);
      throw error;
    }
  },

  async updatePassword(newPassword: string): Promise<any> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message || 'Failed to update password');
      }

      return data;
    } catch (error: any) {
      console.error("Failed to update password:", error.message);
      throw error;
    }
  },
};

export default authService;
