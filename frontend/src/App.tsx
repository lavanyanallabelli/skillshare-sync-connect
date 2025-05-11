
import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './integrations/supabase/client';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layout/MainLayout';
import ProfileLayout from '@/components/layout/ProfileLayout';
import Home from '@/pages/Home';
import Profile from '@/pages/Profile';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import NotFound from '@/pages/NotFound';
import Dashboard from '@/pages/Dashboard';
import Explore from '@/pages/Explore';
import Messages from '@/pages/Messages';
import Sessions from '@/pages/Sessions';
import Skills from '@/pages/Skills';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import About from '@/pages/About';
import Teach from '@/pages/Teach';
import TeacherProfile from '@/pages/TeacherProfile';
import Signup from '@/pages/Signup';

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

export const useAuth = () => useContext(AuthContext);

const App: React.FC = () => {
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
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="signup" element={<Signup />} />
            <Route path="about" element={<About />} />
            <Route path="teach" element={<Teach />} />
            <Route path="teacher/:id" element={<TeacherProfile />} />
          </Route>
          
          <Route path="/" element={<ProfileLayout />}>
            <Route path="profile" element={
              isLoggedIn ? <Profile /> : <Navigate to="/login" />
            } />
            <Route path="dashboard" element={
              isLoggedIn ? <Dashboard /> : <Navigate to="/login" />
            } />
            <Route path="messages" element={
              isLoggedIn ? <Messages /> : <Navigate to="/login" />
            } />
            <Route path="sessions" element={
              isLoggedIn ? <Sessions /> : <Navigate to="/login" />
            } />
            <Route path="skills" element={
              isLoggedIn ? <Skills /> : <Navigate to="/login" />
            } />
            <Route path="settings" element={
              isLoggedIn ? <Settings /> : <Navigate to="/login" />
            } />
            <Route path="notifications" element={
              isLoggedIn ? <Notifications /> : <Navigate to="/login" />
            } />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthContext.Provider>
  );
};

export default App;
