
import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { supabase } from '@/integrations/supabase/client';
import { UserData } from '@/hooks/useProfileData'; 

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import TeacherProfile from '@/pages/TeacherProfile';

// Auth context
interface AuthContextType {
  isLoggedIn: boolean;
  userId: string | null;
  login: () => void;
  logout: () => void;
  userData: UserData | null;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  userId: null,
  login: () => {},
  logout: () => {},
  userData: null,
  setUserData: () => {},
  refreshUserData: async () => {},
});

export const useAuth = () => useContext(AuthContext);

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // Function to load user data from local storage
  const loadUserDataFromStorage = () => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("userData");
      }
    }
  };

  // Function to refresh user data from the database
  const refreshUserData = async () => {
    if (!userId) return;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        return;
      }

      if (profileData) {
        const updatedUserData = {
          id: userId,
          email: '',
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          bio: profileData.bio || "",
          location: profileData.location || "",
          occupation: profileData.occupation || "",
          education: profileData.education || "",
          avatar: profileData.avatar_url || "/placeholder.svg",
          teachingSkills: [],
          learningSkills: [],
          createdAt: profileData.created_at,
        };

        setUserData(updatedUserData);
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.removeItem("userData");
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
        setUserId(session?.user?.id || null);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          loadUserDataFromStorage();
        } else if (event === 'SIGNED_OUT') {
          setUserData(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
      
      if (session) {
        loadUserDataFromStorage();
      }
      setIsInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Don't render anything until we've checked if the user is logged in
  if (!isInitialized) {
    return <div className="h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ 
      isLoggedIn, 
      userId, 
      login, 
      logout,
      userData,
      setUserData,
      refreshUserData
    }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/profile" />} />
          <Route path="/register" element={!isLoggedIn ? <Register /> : <Navigate to="/profile" />} />
          <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/teacher/:id" element={<TeacherProfile />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthContext.Provider>
  );
}

export default App;
