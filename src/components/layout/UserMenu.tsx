import React from "react";
import { Link } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, MessageSquare } from "lucide-react";
import NotificationCenter from "@/components/notifications/NotificationCenter";

interface UserMenuProps {
  unreadCount: number;
  handleLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ unreadCount, handleLogout }) => {
  const { userId } = useAuth();
  const userData = localStorage.getItem('userData');
  const user = userData ? JSON.parse(userData) : null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.email || "User Avatar"} />
            <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuItem className="flex items-center gap-2">
          <Avatar className="h-5 w-5 mr-2">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.email || "User Avatar"} />
            <AvatarFallback>{user?.email ? user.email[0].toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <span>{user?.email || "No User"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4 mr-2" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/dashboard" className="flex items-center gap-2">
            <User className="h-4 w-4 mr-2" />
            <span>Dashboard</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/skills" className="flex items-center gap-2">
            <User className="h-4 w-4 mr-2" />
            <span>My Skills</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/messages" className="flex items-center gap-2 relative">
            <MessageSquare className="h-4 w-4 mr-2" />
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-skill-purple text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4 mr-2" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer" onSelect={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Log out
        </DropdownMenuItem>
        <NotificationCenter />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
