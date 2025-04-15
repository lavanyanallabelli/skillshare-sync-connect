
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

// Create an auth context to manage login state
interface AuthContextType {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
  userId: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  userId: null
});

export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const isAuthenticated = !!session;
        setSession(session);
        setUser(session?.user ?? null);
        setUserId(session?.user?.id ?? null);
        setIsLoggedIn(isAuthenticated);
        
        if (isAuthenticated) {
          localStorage.setItem("isLoggedIn", "true");
        } else {
          localStorage.setItem("isLoggedIn", "false");
          localStorage.removeItem("userData");
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const isAuthenticated = !!session;
      setSession(session);
      setUser(session?.user ?? null);
      setUserId(session?.user?.id ?? null);
      setIsLoggedIn(isAuthenticated);
      setIsLoading(false);
      
      if (isAuthenticated) {
        localStorage.setItem("isLoggedIn", "true");
      } else {
        localStorage.setItem("isLoggedIn", "false");
      }
    });

    // Cleanup subscription
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
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userId }}>
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
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );
};

export default App;
