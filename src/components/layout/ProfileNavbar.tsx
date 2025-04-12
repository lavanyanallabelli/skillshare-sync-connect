
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  LogOut
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfileNavbar: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
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
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Home size={16} />
                <span>Dashboard</span>
              </Link>
              <Link to="/skills" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <BookOpen size={16} />
                <span>Skills</span>
              </Link>
              <Link to="/sessions" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Calendar size={16} />
                <span>Sessions</span>
              </Link>
              <Link to="/communities" className="text-muted-foreground hover:text-foreground flex items-center gap-1">
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
              
              <Link to="/notifications">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-skill-purple text-[10px] text-white flex items-center justify-center">
                    3
                  </span>
                </Button>
              </Link>
              
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
        <div className="absolute top-16 left-0 w-full bg-background border-b shadow-lg animate-fade-in">
          <div className="container py-4 flex flex-col gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-md flex items-center gap-2">
              <Home size={16} />
              Dashboard
            </Link>
            <Link to="/skills" className="p-2 hover:bg-muted rounded-md flex items-center gap-2">
              <BookOpen size={16} />
              Skills
            </Link>
            <Link to="/sessions" className="p-2 hover:bg-muted rounded-md flex items-center gap-2">
              <Calendar size={16} />
              Sessions
            </Link>
            <Link to="/communities" className="p-2 hover:bg-muted rounded-md flex items-center gap-2">
              <Users size={16} />
              Communities
            </Link>
            <Link to="/settings" className="p-2 hover:bg-muted rounded-md flex items-center gap-2">
              <Settings size={16} />
              Settings
            </Link>
            <Link to="/messages" className="p-2 hover:bg-muted rounded-md flex items-center gap-2">
              <MessageSquare size={16} />
              Messages
              <span className="ml-auto bg-skill-purple text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                2
              </span>
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
