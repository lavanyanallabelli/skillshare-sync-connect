
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/App";
import { SearchForm } from "./SearchForm";
import { UserMenu } from "./UserMenu";
import { MobileNavMenu } from "./MobileNavMenu";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_EMAIL = "lavanyanallabelli@gmail.com";

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, logout, userId } = useAuth();
  const unreadCount = useUnreadMessages(userId);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isLoggedIn && userId) {
        const { data: userData, error } = await supabase.auth.getUser();
        if (!error && userData?.user?.email === ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      }
    };
    
    checkAdminStatus();
  }, [isLoggedIn, userId]);
  
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };
  
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Teach", path: "/teach" },
    { name: "About", path: "/about" },
    // Add the Admin route only for the admin user
    ...(isAdmin ? [{ name: "Admin", path: "/admin" }] : [])
  ];

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
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} className="text-muted-foreground hover:text-foreground">
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {!isMobile ? (
            <>
              <SearchForm />
              
              {isLoggedIn && (
                <NotificationCenter />
              )}
              
              {isLoggedIn ? (
                <UserMenu unreadCount={unreadCount} handleLogout={handleLogout} />
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="outline" size="sm">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="bg-skill-purple hover:bg-skill-purple-dark">
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}
            </>
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
      
      {isMobile && isMenuOpen && (
        <MobileNavMenu
          isLoggedIn={isLoggedIn}
          unreadCount={unreadCount}
          handleLogout={handleLogout}
          onClose={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
