
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from "react";
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
  // Check localStorage for login state and user data
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });
  
  const [userId, setUserId] = useState<string | null>(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        return parsedData.id || null;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
    
    // Update userId from userData
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setUserId(parsedData.id || null);
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.setItem("isLoggedIn", "false");
    // Clear any user-related data from localStorage
    localStorage.removeItem("userData");
  };

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
