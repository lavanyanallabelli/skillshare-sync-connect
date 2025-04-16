
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Hero: React.FC = () => {
  return (
    <section className="hero-gradient text-white">
      <div className="container py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Learn and teach skills <br /> on your own terms
            </h1>
            <p className="text-lg mb-8 text-white/90">
              Connect with passionate individuals, share knowledge, and grow together 
              on SkillSync's peer-to-peer learning platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/explore">
                <Button size="lg" className="w-full sm:w-auto bg-white text-skill-purple hover:bg-white/90">
                  Explore Skills
                </Button>
              </Link>
              <Link to="/teach">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white/10">
                  Become a Teacher
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -top-5 -left-5 w-64 h-64 bg-white/10 rounded-lg animate-pulse-light"></div>
            <div className="absolute top-10 left-10 w-64 h-64 bg-white/20 rounded-lg"></div>
            <img 
              src="https://images.unsplash.com/photo-1543269865-cbf427effbad?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80" 
              alt="People learning together" 
              className="relative z-10 rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
