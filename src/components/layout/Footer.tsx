
import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Facebook, Instagram } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-muted py-12">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="rounded-full bg-skill-purple p-1">
                <div className="h-6 w-6 rounded-full bg-white flex items-center justify-center">
                  <span className="text-skill-purple font-bold">S</span>
                </div>
              </div>
              <span className="text-xl font-bold">SkillSync</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Connect, teach, and learn new skills with people around the world.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-muted-foreground hover:text-foreground">About Us</Link></li>
              <li><Link to="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
              <li><Link to="/press" className="text-muted-foreground hover:text-foreground">Press</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/help" className="text-muted-foreground hover:text-foreground">Help Center</Link></li>
              <li><Link to="/safety" className="text-muted-foreground hover:text-foreground">Safety & Trust</Link></li>
              <li><Link to="/guidelines" className="text-muted-foreground hover:text-foreground">Community Guidelines</Link></li>
              <li><Link to="/testimonials" className="text-muted-foreground hover:text-foreground">Testimonials</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/terms" className="text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              <li><Link to="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
              <li><Link to="/cookies" className="text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
              <li><Link to="/accessibility" className="text-muted-foreground hover:text-foreground">Accessibility</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SkillSync. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
