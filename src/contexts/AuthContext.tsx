
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define the auth context type
export interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null;
  loading: boolean;
  setIsLoggedIn: (value: boolean) => void;
  setUserId: (value: string | null) => void;
  logout: () => Promise<void>;
}

// Create the auth context
export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userId: null,
  loading: true,
  setIsLoggedIn: () => {},
  setUserId: () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for an existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          setIsLoggedIn(true);
          setUserId(session.user.id);
        } else if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setUserId(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setUserId(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userId,
        loading,
        setIsLoggedIn,
        setUserId,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create the auth hook
export const useAuth = () => useContext(AuthContext);
