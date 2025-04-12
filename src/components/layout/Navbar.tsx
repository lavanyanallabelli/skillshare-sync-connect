
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar: React.FC = () => {
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
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
              <Link to="/explore" className="text-muted-foreground hover:text-foreground">
                Explore
              </Link>
              <Link to="/teach" className="text-muted-foreground hover:text-foreground">
                Teach
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground">
                How It Works
              </Link>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {!isMobile ? (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  className="h-9 rounded-full border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-skill-purple"
                />
              </div>
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
      
      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-background border-b shadow-lg animate-fade-in">
          <div className="container py-4 flex flex-col gap-4">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search skills..."
                className="w-full h-9 rounded-full border bg-background pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-skill-purple"
              />
            </div>
            <Link to="/explore" className="p-2 hover:bg-muted rounded-md">
              Explore
            </Link>
            <Link to="/teach" className="p-2 hover:bg-muted rounded-md">
              Teach
            </Link>
            <Link to="/about" className="p-2 hover:bg-muted rounded-md">
              How It Works
            </Link>
            <div className="flex gap-2 pt-2 border-t">
              <Link to="/login" className="flex-1">
                <Button variant="outline" className="w-full">
                  Log in
                </Button>
              </Link>
              <Link to="/signup" className="flex-1">
                <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
