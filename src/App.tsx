
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/toaster';
import MainLayout from './components/layout/MainLayout';
import ProfileLayout from './components/layout/ProfileLayout';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import Dashboard from './pages/Dashboard';
import Explore from './pages/Explore';
import Messages from './pages/Messages';
import Sessions from './pages/Sessions';
import Skills from './pages/Skills';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import About from './pages/About';
import Teach from './pages/Teach';
import TeacherProfile from './pages/TeacherProfile';
import Signup from './pages/Signup';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  
  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
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
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="messages" element={
            <ProtectedRoute><Messages /></ProtectedRoute>
          } />
          <Route path="sessions" element={
            <ProtectedRoute><Sessions /></ProtectedRoute>
          } />
          <Route path="skills" element={
            <ProtectedRoute><Skills /></ProtectedRoute>
          } />
          <Route path="settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="notifications" element={
            <ProtectedRoute><Notifications /></ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppRoutes />
    <Toaster />
  </AuthProvider>
);

export default App;
