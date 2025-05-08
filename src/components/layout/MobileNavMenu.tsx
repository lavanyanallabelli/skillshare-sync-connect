import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/App";

interface MobileNavMenuProps {
  isLoggedIn: boolean;
  unreadCount: number;
  handleLogout: () => void;
  onClose: () => void;
}

const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
  isLoggedIn,
  unreadCount,
  handleLogout,
  onClose,
}) => {
  const navigate = useNavigate();
  const { userId } = useAuth();

  const handleLogoutAndClose = () => {
    handleLogout();
    onClose();
    navigate("/");
  };

  // Add Reviews to the navItems array along with the existing items
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Explore", path: "/explore" },
    { name: "Teach", path: "/teach" },
    { name: "About", path: "/about" },
    { name: "Reviews", path: "/reviews" },
  ];

  return (
    <div className="px-4 py-6">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="block py-2 text-lg text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              {item.name}
            </Link>
          </li>
        ))}
        {isLoggedIn && (
          <li>
            <Link
              to="/notifications"
              className="block py-2 text-lg text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              Notifications{" "}
              {unreadCount > 0 && (
                <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                  {unreadCount}
                </span>
              )}
            </Link>
          </li>
        )}
        {isLoggedIn && (
          <li>
            <Link
              to={`/teachers/${userId}`}
              className="block py-2 text-lg text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              Profile
            </Link>
          </li>
        )}
      </ul>
      <div className="mt-8 space-y-2">
        {isLoggedIn ? (
          <Button variant="outline" className="w-full" onClick={handleLogoutAndClose}>
            Log out
          </Button>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline" className="w-full" onClick={onClose}>
                Log in
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark" onClick={onClose}>
                Sign up
              </Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default MobileNavMenu;
