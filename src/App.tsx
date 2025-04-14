
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
}

export const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const queryClient = new QueryClient();

const App = () => {
  // Check localStorage for login state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem("isLoggedIn") === "true";
  });

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem("isLoggedIn", "true");
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem("isLoggedIn", "false");
    // Clear any user-related data from localStorage
    localStorage.removeItem("userData");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
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
              <Route path="/teacher/:id" element={isLoggedIn ? <TeacherProfile /> : <Navigate to="/login" />} />
              <Route path="/messages" element={isLoggedIn ? <Messages /> : <Navigate to="/login" />} />
              <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/profile" element={isLoggedIn ? <Profile /> : <Navigate to="/login" />} />
              <Route path="/skills" element={isLoggedIn ? <Skills /> : <Navigate to="/login" />} />
              <Route path="/sessions" element={isLoggedIn ? <Navigate to="/profile?tab=schedule" /> : <Navigate to="/login" />} />
              <Route path="/communities" element={isLoggedIn ? <Navigate to="/dashboard?tab=communities" /> : <Navigate to="/login" />} />
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
