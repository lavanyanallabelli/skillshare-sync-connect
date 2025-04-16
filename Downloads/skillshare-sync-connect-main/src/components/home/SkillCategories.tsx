
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Palette, Code, Music, Dumbbell, ChefHat, Globe, BookOpen, BarChart4 } from "lucide-react";

// Sample category data
const categories = [
  {
    id: 1,
    name: "Arts & Design",
    icon: Palette,
    color: "bg-skill-purple/10 text-skill-purple",
  },
  {
    id: 2,
    name: "Technology",
    icon: Code,
    color: "bg-skill-teal/10 text-skill-teal",
  },
  {
    id: 3,
    name: "Music",
    icon: Music,
    color: "bg-skill-orange/10 text-skill-orange",
  },
  {
    id: 4,
    name: "Fitness",
    icon: Dumbbell,
    color: "bg-green-500/10 text-green-500",
  },
  {
    id: 5,
    name: "Cooking",
    icon: ChefHat,
    color: "bg-red-500/10 text-red-500",
  },
  {
    id: 6,
    name: "Languages",
    icon: Globe,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: 7,
    name: "Academic",
    icon: BookOpen,
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    id: 8,
    name: "Business",
    icon: BarChart4,
    color: "bg-skill-pink/10 text-skill-pink",
  },
];

const SkillCategories: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover thousands of skills across popular categories taught by our community members.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} to={`/category/${category.id}`}>
              <Button 
                variant="outline" 
                className="w-full h-auto py-6 flex flex-col items-center gap-3 transition-all hover:border-skill-purple hover:shadow-md"
              >
                <div className={`p-3 rounded-full ${category.color}`}>
                  <category.icon size={24} />
                </div>
                <span>{category.name}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SkillCategories;
