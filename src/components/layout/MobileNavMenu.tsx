
import React from "react";
import { Link } from "react-router-dom";
import { Home, MessageSquare, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileNavMenuProps {
  isLoggedIn: boolean;
  handleLogout: () => void;
  onClose: () => void;
}

export const MobileNavMenu: React.FC<MobileNavMenuProps> = ({ 
  isLoggedIn, 
  handleLogout, 
  onClose 
}) => {
  return (
    <div className="absolute top-16 left-0 w-full bg-background border-b shadow-lg animate-fade-in z-50">
      <div className="container py-4 flex flex-col gap-3">
        <Link 
          to="/explore" 
          className="p-2 rounded-md hover:bg-muted"
          onClick={onClose}
        >
          Explore
        </Link>
        <Link 
          to="/teach" 
          className="p-2 rounded-md hover:bg-muted"
          onClick={onClose}
        >
          Teach
        </Link>
        <Link 
          to="/about" 
          className="p-2 rounded-md hover:bg-muted"
          onClick={onClose}
        >
          How It Works
        </Link>
        
        {isLoggedIn ? (
          <>
            <div className="border-t my-2"></div>
            <Link 
              to="/messages"
              className="p-2 rounded-md flex items-center gap-2 hover:bg-muted"
              onClick={onClose}
            >
              <MessageSquare size={16} />
              Messages
            </Link>
            <Link 
              to="/settings"
              className="p-2 rounded-md flex items-center gap-2 hover:bg-muted"
              onClick={onClose}
            >
              <Settings size={16} />
              Settings
            </Link>
            <Button
              variant="outline"
              className="mt-2 w-full flex items-center justify-center gap-2"
              onClick={() => {
                handleLogout();
                onClose();
              }}
            >
              <LogOut size={16} />
              Log out
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-2 mt-2">
            <Link to="/login" onClick={onClose}>
              <Button variant="outline" className="w-full">Log in</Button>
            </Link>
            <Link to="/signup" onClick={onClose}>
              <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark">Sign up</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
