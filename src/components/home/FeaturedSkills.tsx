
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock } from "lucide-react";

// Sample data for featured skills
const featuredSkills = [
  {
    id: 1,
    title: "Digital Photography Basics",
    category: "Arts & Design",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2073&q=80",
    rating: 4.8,
    students: 324,
    duration: "4 weeks",
    featured: true,
  },
  {
    id: 2,
    title: "Introduction to Coding",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80",
    rating: 4.6,
    students: 512,
    duration: "6 weeks",
    featured: true,
  },
  {
    id: 3,
    title: "Yoga for Beginners",
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    rating: 4.9,
    students: 218,
    duration: "4 weeks",
    featured: false,
  },
  {
    id: 4,
    title: "Guitar Fundamentals",
    category: "Music",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    rating: 4.7,
    students: 187,
    duration: "8 weeks",
    featured: false,
  },
];

const FeaturedSkills: React.FC = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Featured Skills</h2>
          <Link to="/explore" className="text-skill-purple hover:text-skill-purple-dark flex items-center gap-1">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredSkills.map((skill) => (
            <Link key={skill.id} to={`/skills/${skill.id}`}>
              <Card className={skill.featured ? "skill-card-featured" : "skill-card"}>
                <div className="aspect-video relative mb-4 overflow-hidden rounded-md">
                  <img 
                    src={skill.image} 
                    alt={skill.title} 
                    className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
                  />
                  {skill.featured && (
                    <Badge className="absolute top-2 right-2 bg-skill-purple">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardContent className="p-0 mb-4">
                  <Badge variant="outline" className="mb-2">
                    {skill.category}
                  </Badge>
                  <h3 className="text-lg font-medium mb-2">{skill.title}</h3>
                  <div className="flex items-center gap-1 text-amber-500 mb-2">
                    <Star size={16} fill="currentColor" />
                    <span className="text-sm">{skill.rating}</span>
                  </div>
                </CardContent>
                <CardFooter className="p-0 flex justify-between items-center text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{skill.students} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{skill.duration}</span>
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSkills;
