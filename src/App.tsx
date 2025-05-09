
import React, { createContext, useState, useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Explore from './pages/Explore';
import Teach from './pages/Teach';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import Sessions from './pages/Sessions';
import Skills from './pages/Skills';
import TeacherProfile from './pages/TeacherProfile';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Reviews from './pages/Reviews';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from './integrations/supabase/client';

interface AuthContextProps {
  isLoggedIn: boolean;
  userId: string | null;
  login: (userId: string) => void;
  logout: () => void;
  refreshUserData: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  isLoggedIn: false,
  userId: null,
  login: () => {},
  logout: () => {},
  refreshUserData: () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('supabase.auth.token');
    if (storedToken) {
      const parsedToken = JSON.parse(storedToken);
      if (parsedToken?.currentSession?.user?.id) {
        setIsLoggedIn(true);
        setUserId(parsedToken.currentSession.user.id);
      }
    }
  }, []);

  const login = (userId: string) => {
    setIsLoggedIn(true);
    setUserId(userId);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserId(null);
    localStorage.removeItem('supabase.auth.token');
  };

  const refreshUserData = () => {
    // This function will check and update the auth state
    const checkAuthState = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setIsLoggedIn(true);
        setUserId(data.user.id);
      } else {
        setIsLoggedIn(false);
        setUserId(null);
      }
    };
    
    checkAuthState();
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userId, login, logout, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/teach" element={<Teach />} />
          <Route path="/about" element={<About />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/teachers/:id" element={<TeacherProfile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
