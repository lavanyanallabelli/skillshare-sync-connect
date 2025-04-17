
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Explore from "./pages/Explore";
import Teach from "./pages/Teach";
import About from "./pages/About";
import Messages from "./pages/Messages";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Skills from "./pages/Skills";
import TeacherProfile from "./pages/TeacherProfile";
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  userId: string | null;
  refreshUserData: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  userId: null,
  refreshUserData: async () => {}
});

export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUserData = async () => {
    if (!userId) return;
    
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }
      
      if (profileData) {
        // Fetch experiences
        const { data: experiences, error: experiencesError } = await supabase
          .from('user_experiences')
          .select('*')
          .eq('user_id', userId);
          
        if (experiencesError) {
          console.error("Error fetching experiences:", experiencesError);
        }
        
        // Fetch education
        const { data: education, error: educationError } = await supabase
          .from('user_education')
          .select('*')
          .eq('user_id', userId);
          
        if (educationError) {
          console.error("Error fetching education:", educationError);
        }
        
        // Fetch teaching skills
        const { data: teachingSkills, error: teachingError } = await supabase
          .from('teaching_skills')
          .select('skill, proficiency_level')
          .eq('user_id', userId);
          
        if (teachingError) {
          console.error("Error fetching teaching skills:", teachingError);
        }
        
        // Fetch learning skills
        const { data: learningSkills, error: learningError } = await supabase
          .from('learning_skills')
          .select('skill')
          .eq('user_id', userId);
          
        if (learningError) {
          console.error("Error fetching learning skills:", learningError);
        }
        
        const userData = {
          id: userId,
          email: user?.email || "",
          firstName: profileData.first_name,
          lastName: profileData.last_name,
          bio: profileData.bio || "",
          location: profileData.location || "",
          occupation: profileData.occupation || "",
          education: profileData.education || "",
          avatar: profileData.avatar_url || "/placeholder.svg",
          teachingSkills: teachingSkills?.map(item => item.skill) || [],
          learningSkills: learningSkills?.map(item => item.skill) || [],
          experiences: experiences || [],
          educations: education || [],
          createdAt: profileData.created_at,
          headline: profileData.headline,
          website: profileData.website,
          linkedin: profileData.linkedin,
          github: profileData.github,
          twitter: profileData.twitter
        };
        
        localStorage.setItem("userData", JSON.stringify(userData));
        console.log("Profile data refreshed:", userData);
      }
    } catch (error) {
      console.error("Error in refreshUserData:", error);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);
        const isAuthenticated = !!session;
        setSession(session);
        setUser(session?.user ?? null);
        setUserId(session?.user?.id ?? null);
        setIsLoggedIn(isAuthenticated);
        
        if (isAuthenticated && session?.user?.id) {
          localStorage.setItem("isLoggedIn", "true");
          setTimeout(() => {
            refreshUserData();
          }, 0);
        } else {
          localStorage.setItem("isLoggedIn", "false");
          localStorage.removeItem("userData");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session check:", session?.user?.id);
      const isAuthenticated = !!session;
      setSession(session);
      setUser(session?.user ?? null);
      setUserId(session?.user?.id ?? null);
      setIsLoggedIn(isAuthenticated);
      setIsLoading(false);
      
      if (isAuthenticated && session?.user?.id) {
        localStorage.setItem("isLoggedIn", "true");
        setTimeout(() => {
          refreshUserData();
        }, 0);
      } else {
        localStorage.setItem("isLoggedIn", "false");
        localStorage.removeItem("userData");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUser(null);
    setSession(null);
    setUserId(null);
    localStorage.setItem("isLoggedIn", "false");
    localStorage.removeItem("userData");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userId, refreshUserData }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={isLoggedIn ? <Navigate to="/profile" /> : <Login />} />
              <Route path="/signup" element={isLoggedIn ? <Navigate to="/profile" /> : <Signup />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/teach" element={<Teach />} />
              <Route path="/about" element={<About />} />
              <Route path="/teacher/:id" element={<TeacherProfile />} />
              <Route path="/messages" element={isLoggedIn ? <Messages /> : <Navigate to="/login" />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/skills" element={isLoggedIn ? <Skills /> : <Navigate to="/login" />} />
              <Route path="/sessions" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/communities" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/oauth/callback" element={<OAuthCallback />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    login();
    navigate('/profile');
  }, [navigate, login]);

  return <div>Logging in...</div>;
};

export default App;
