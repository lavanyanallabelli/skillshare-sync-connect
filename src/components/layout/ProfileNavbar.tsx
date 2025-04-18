
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
import { useAuth } from "@/App";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";

// Notification type
export interface Notification {
  id: string;
  type: "message" | "request" | "system";
  title: string;
  description: string;
  time: string;
  read: boolean;
  actionUrl?: string;
}

// Mock notifications
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "request",
    title: "New Learning Request",
    description: "Alex Chen wants to learn React from you",
    time: "Just now",
    read: false,
    actionUrl: "/profile?tab=requests"
  },
  {
    id: "2",
    type: "message",
    title: "New Message",
    description: "Sarah Williams sent you a message",
    time: "2 hours ago",
    read: false,
    actionUrl: "/messages"
  },
  {
    id: "3",
    type: "system",
    title: "Profile Viewed",
    description: "Your profile was viewed by 5 people this week",
    time: "1 day ago",
    read: true
  }
];

// Global state for notifications (in a real app, this would be in context or redux)
let globalNotifications = [...initialNotifications];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState(globalNotifications);
  
  const addNotification = (notification: Omit<Notification, "id" | "read" | "time">) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      read: false,
      time: "Just now"
    };
    
    globalNotifications = [newNotification, ...globalNotifications];
    setNotifications(globalNotifications);
    return newNotification;
  };
  
  const markAsRead = (id: string) => {
    globalNotifications = globalNotifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    );
    setNotifications(globalNotifications);
  };
  
  const markAllAsRead = () => {
    globalNotifications = globalNotifications.map(notif => ({ ...notif, read: true }));
    setNotifications(globalNotifications);
  };
  
  return { 
    notifications, 
    addNotification, 
    markAsRead, 
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.read).length
  };
};

const ProfileNavbar: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };
  
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
            <div className="flex items-center gap-2">
              <Link to="/messages">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageSquare size={20} />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-skill-purple text-[10px] text-white flex items-center justify-center">
                    2
                  </span>
                </Button>
              </Link>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-skill-purple text-[10px] text-white flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-medium">Notifications</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={markAllAsRead}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Mark all as read
                    </Button>
                  </div>
                  
                  <div className="max-h-80 overflow-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-muted-foreground">
                        <p>No notifications</p>
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b last:border-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                            !notification.read ? 'bg-muted/20' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`rounded-full p-2 ${
                              notification.type === 'message' ? 'bg-blue-100 text-blue-600' :
                              notification.type === 'request' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {notification.type === 'message' ? (
                                <MessageSquare size={14} />
                              ) : notification.type === 'request' ? (
                                <Calendar size={14} />
                              ) : (
                                <Bell size={14} />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notification.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.description}</p>
                              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="h-2 w-2 rounded-full bg-skill-purple"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder.svg" alt="User avatar" />
                      <AvatarFallback>US</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">View Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
              <span className="ml-auto bg-skill-purple text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                2
              </span>
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
