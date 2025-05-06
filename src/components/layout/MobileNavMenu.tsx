
import React from "react";
import { Link } from "react-router-dom";
import { UserIcon, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavMenuProps {
  isLoggedIn: boolean;
  unreadCount: number;
  handleLogout: () => void;
  onClose: () => void;
}

export const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
  isLoggedIn,
  unreadCount,
  handleLogout,
  onClose,
}) => {
  return (
    <div className="absolute top-16 left-0 w-full bg-background border-b shadow-lg animate-fade-in">
      <div className="container py-4 flex flex-col gap-4">
        <Link to="/explore" className="p-2 hover:bg-muted rounded-md" onClick={onClose}>
          Explore
        </Link>
        <Link to="/teach" className="p-2 hover:bg-muted rounded-md" onClick={onClose}>
          Teach
        </Link>
        <Link to="/about" className="p-2 hover:bg-muted rounded-md" onClick={onClose}>
          How It Works
        </Link>
        
        {isLoggedIn ? (
          <>
            <Link to="/profile" className="p-2 hover:bg-muted rounded-md flex items-center gap-2" onClick={onClose}>
              <UserIcon size={16} />
              Profile
            </Link>
            <Link to="/dashboard" className="p-2 hover:bg-muted rounded-md flex items-center gap-2" onClick={onClose}>
              <UserIcon size={16} />
              Dashboard
            </Link>
            <Link to="/skills" className="p-2 hover:bg-muted rounded-md flex items-center gap-2" onClick={onClose}>
              <UserIcon size={16} />
              My Skills
            </Link>
            <Link to="/messages" className="p-2 hover:bg-muted rounded-md flex items-center gap-2" onClick={onClose}>
              <MessageSquare size={16} />
              Messages
              {unreadCount > 0 && (
                <span className="ml-auto bg-skill-purple text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleLogout();
                  onClose();
                }}
              >
                Log out
              </Button>
            </div>
          </>
        ) : (
          <div className="flex gap-2 pt-2 border-t">
            <Link to="/login" className="flex-1" onClick={onClose}>
              <Button variant="outline" className="w-full">
                Log in
              </Button>
            </Link>
            <Link to="/signup" className="flex-1" onClick={onClose}>
              <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark">
                Sign up
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
