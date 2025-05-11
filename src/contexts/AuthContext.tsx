
import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../integrations/supabase/client';

interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userId: null,
  login: () => {},
  logout: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        setUserId(session?.user?.id || null);
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
      
      // Store user data in localStorage for easy access
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          avatar: session.user.user_metadata?.avatar_url || "/placeholder.svg"
        };
        localStorage.setItem('userData', JSON.stringify(userData));
      } else {
        localStorage.removeItem('userData');
      }
    });

    checkAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setUserId(null);
      localStorage.removeItem('userData');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
