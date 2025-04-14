
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Star, Users, Clock, Filter, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";

// Sample skills data - in a real app, this would come from an API
const allSkills = [
  {
    id: 1,
    title: "Digital Photography Basics",
    category: "Arts & Design",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2073&q=80",
    rating: 4.8,
    students: 324,
    duration: "4 weeks",
    teacherId: "32",
    teacherName: "Alex Chen",
    teacherAvatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: 2,
    title: "Introduction to Coding",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2069&q=80",
    rating: 4.6,
    students: 512,
    duration: "6 weeks",
    teacherId: "44",
    teacherName: "Sarah Williams",
    teacherAvatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: 3,
    title: "Yoga for Beginners",
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    rating: 4.9,
    students: 218,
    duration: "4 weeks",
    teacherId: "67",
    teacherName: "Michael Chen",
    teacherAvatar: "https://randomuser.me/api/portraits/men/67.jpg",
  },
  {
    id: 4,
    title: "Guitar Fundamentals",
    category: "Music",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    rating: 4.7,
    students: 187,
    duration: "8 weeks",
    teacherId: "22",
    teacherName: "Jennifer Lopez",
    teacherAvatar: "https://randomuser.me/api/portraits/women/22.jpg",
  },
  {
    id: 5,
    title: "French for Travelers",
    category: "Languages",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1473&q=80",
    rating: 4.5,
    students: 156,
    duration: "4 weeks",
    teacherId: "45",
    teacherName: "Pierre Dubois",
    teacherAvatar: "https://randomuser.me/api/portraits/men/45.jpg",
  },
  {
    id: 6,
    title: "Cooking Basics",
    category: "Cooking",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    rating: 4.8,
    students: 342,
    duration: "6 weeks",
    teacherId: "59",
    teacherName: "Maria Rodriguez",
    teacherAvatar: "https://randomuser.me/api/portraits/women/59.jpg",
  },
];

// Categories for filtering
const categories = ["All", "Arts & Design", "Technology", "Fitness", "Music", "Languages", "Cooking", "Business", "Academic"];

const Explore: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minRating, setMinRating] = useState(0);

  // Filter skills based on search, category and rating
  const filteredSkills = allSkills.filter((skill) => {
    const matchesSearch = skill.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    const matchesRating = skill.rating >= minRating;
    
    return matchesSearch && matchesCategory && matchesRating;
  });

  const handleSendRequest = (skillId: number) => {
    toast({
      title: "Request Sent!",
      description: "Your learning request has been sent to the teacher.",
    });
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Explore Skills</h1>
        
        {/* Search and Filter Section */}
        <div className="bg-muted rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="col-span-1 md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for skills..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Filter className="h-4 w-4" />
              <span>Minimum Rating:</span>
            </div>
            <div className="flex-1 flex items-center gap-4">
              <div className="flex-1">
                <Slider
                  value={[minRating]}
                  min={0}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => setMinRating(value[0])}
                />
              </div>
              <div className="w-12 text-right">{minRating.toFixed(1)}</div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <p className="mb-6 text-muted-foreground">
          Found {filteredSkills.length} skill{filteredSkills.length !== 1 ? 's' : ''}
        </p>
        
        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSkills.map((skill) => (
            <Card key={skill.id} className="overflow-hidden">
              <div className="aspect-video relative">
                <img 
                  src={skill.image} 
                  alt={skill.title} 
                  className="object-cover w-full h-full"
                />
              </div>
              <CardContent className="p-6">
                <Badge variant="outline" className="mb-2">
                  {skill.category}
                </Badge>
                <h3 className="text-xl font-medium mb-2">{skill.title}</h3>
                <div className="flex items-center gap-1 text-amber-500 mb-4">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm">{skill.rating}</span>
                </div>
                
                <Link to={`/teacher/${skill.teacherId}`} className="block">
                  <div className="flex items-center gap-3 mb-4 hover:bg-muted/50 p-2 rounded-md transition-colors">
                    <img 
                      src={skill.teacherAvatar} 
                      alt={skill.teacherName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium">{skill.teacherName}</p>
                      <p className="text-xs text-muted-foreground">Teacher</p>
                    </div>
                  </div>
                </Link>
              </CardContent>
              <CardFooter className="p-6 pt-0 flex flex-col gap-4">
                <div className="flex justify-between items-center text-sm text-muted-foreground w-full">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{skill.students} students</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{skill.duration}</span>
                  </div>
                </div>
                <Button 
                  className="w-full bg-skill-purple hover:bg-skill-purple-dark"
                  onClick={() => handleSendRequest(skill.id)}
                >
                  Send Learning Request
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Explore;
