import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Bell, 
  MessageSquare, 
  Home,
  Users,
  Calendar,
  Settings,
  BookOpen,
  LogOut,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserMenu } from "./UserMenu";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import NotificationCenter from "@/components/notifications/NotificationCenter";

const ProfileNavbar: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userId } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const unreadMessageCount = useUnreadMessages(userId || undefined);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-full bg-skill-purple p-1">
              <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                <span className="text-skill-purple font-bold">S</span>
              </div>
            </div>
            <span className="text-xl font-bold">SkillSync</span>
          </Link>
          
          {!isMobile && (
            <div className="hidden md:flex items-center gap-4">
              <Link 
                to="/dashboard" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard') 
                    ? 'bg-muted text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                } flex items-center gap-1`}
              >
                <Home size={16} />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/skills" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/skills') 
                    ? 'bg-muted text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                } flex items-center gap-1`}
              >
                <BookOpen size={16} />
                <span>Skills</span>
              </Link>
              <Link 
                to="/sessions" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/sessions') 
                    ? 'bg-muted text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                } flex items-center gap-1`}
              >
                <Calendar size={16} />
                <span>Sessions</span>
              </Link>
              <Link 
                to="/communities" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/communities') 
                    ? 'bg-muted text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                } flex items-center gap-1`}
              >
                <Users size={16} />
                <span>Communities</span>
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {!isMobile ? (
            <UserMenu handleLogout={handleLogout} unreadCount={unreadMessageCount} />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-background border-b shadow-lg animate-fade-in z-50">
          <div className="container py-4 flex flex-col gap-4">
            <Link 
              to="/dashboard" 
              className={`p-2 rounded-md flex items-center gap-2 ${
                isActive('/dashboard') ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={16} />
              Dashboard
            </Link>
            <Link 
              to="/skills" 
              className={`p-2 rounded-md flex items-center gap-2 ${
                isActive('/skills') ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen size={16} />
              Skills
            </Link>
            <Link 
              to="/sessions" 
              className={`p-2 rounded-md flex items-center gap-2 ${
                isActive('/sessions') ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar size={16} />
              Sessions
            </Link>
            <Link 
              to="/communities" 
              className={`p-2 rounded-md flex items-center gap-2 ${
                isActive('/communities') ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Users size={16} />
              Communities
            </Link>
            <Link 
              to="/messages"
              className={`p-2 rounded-md flex items-center gap-2 ${
                isActive('/messages') ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageSquare size={16} />
              Messages
              {unreadMessageCount > 0 && (
                <span className="ml-auto bg-skill-purple text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                  {unreadMessageCount}
                </span>
              )}
            </Link>
            <Link 
              to="/notifications"
              className={`p-2 rounded-md flex items-center gap-2 ${
                isActive('/notifications') ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Bell size={16} />
              Notifications
            </Link>
            <Link 
              to="/settings"
              className={`p-2 rounded-md flex items-center gap-2 ${
                isActive('/settings') ? 'bg-muted' : 'hover:bg-muted'
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Settings size={16} />
              Settings
            </Link>
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ProfileNavbar;
