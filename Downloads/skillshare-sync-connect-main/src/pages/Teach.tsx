
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Sample skill categories
const categories = ["Arts & Design", "Technology", "Fitness", "Music", "Languages", "Cooking", "Business", "Academic"];

// Sample incoming requests
const incomingRequests = [
  {
    id: 1,
    studentName: "Jamie Smith",
    studentAvatar: "https://randomuser.me/api/portraits/men/22.jpg",
    skillRequested: "Introduction to Coding",
    message: "Hi! I'm interested in learning to code. I've tried some tutorials but I think I need someone to guide me through the basics.",
    requestDate: "2 days ago",
  },
  {
    id: 2,
    studentName: "Rebecca Johnson",
    studentAvatar: "https://randomuser.me/api/portraits/women/33.jpg",
    skillRequested: "Digital Photography",
    message: "Hello! I just bought my first DSLR camera and would love to learn how to use it properly.",
    requestDate: "5 days ago",
  }
];

const Teach: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'create' | 'requests'>('create');
  const [skillTitle, setSkillTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [experience, setExperience] = useState("");
  
  const handleCreateSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillTitle || !selectedCategory || !description || !experience) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields to create your skill listing.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Skill listing created!",
      description: "Your skill listing has been published. You'll be notified when someone is interested.",
    });
    
    // Reset form
    setSkillTitle("");
    setSelectedCategory("");
    setDescription("");
    setExperience("");
  };
  
  const handleAcceptRequest = (requestId: number) => {
    toast({
      title: "Request accepted!",
      description: "You've accepted the request. You can now message this student.",
    });
  };
  
  const handleDeclineRequest = (requestId: number) => {
    toast({
      title: "Request declined",
      description: "The request has been declined.",
    });
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <h1 className="text-3xl font-bold mb-8">Teach on SkillSync</h1>
        
        <div className="flex border-b mb-8">
          <button
            className={`pb-2 px-4 font-medium ${
              activeTab === 'create' 
                ? 'border-b-2 border-skill-purple text-skill-purple' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('create')}
          >
            Create Skill Listing
          </button>
          <button
            className={`pb-2 px-4 font-medium ${
              activeTab === 'requests' 
                ? 'border-b-2 border-skill-purple text-skill-purple' 
                : 'text-muted-foreground'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Incoming Requests ({incomingRequests.length})
          </button>
        </div>
        
        {activeTab === 'create' ? (
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleCreateSkill} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="skillTitle" className="block font-medium">
                  What skill do you want to teach?
                </label>
                <Input
                  id="skillTitle"
                  placeholder="e.g., Digital Photography, Web Development, Spanish"
                  value={skillTitle}
                  onChange={(e) => setSkillTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="category" className="block font-medium">
                  Category
                </label>
                <select
                  id="category"
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="description" className="block font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn from you and your teaching approach..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="experience" className="block font-medium">
                  Your Experience
                </label>
                <Textarea
                  id="experience"
                  placeholder="Describe your experience and qualifications in this skill..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-skill-purple hover:bg-skill-purple-dark"
              >
                Create Skill Listing
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {incomingRequests.length > 0 ? (
              incomingRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <img 
                        src={request.studentAvatar} 
                        alt={request.studentName}
                        className="h-12 w-12 rounded-full object-cover" 
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{request.studentName}</h3>
                            <p className="text-sm text-muted-foreground">
                              Requested {request.requestDate}
                            </p>
                          </div>
                          <Badge>{request.skillRequested}</Badge>
                        </div>
                        <p className="text-sm mb-4">{request.message}</p>
                        <div className="flex gap-3">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            Decline
                          </Button>
                          <Button 
                            className="flex-1 bg-skill-purple hover:bg-skill-purple-dark"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            Accept & Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-2">No incoming requests yet</h3>
                <p className="text-muted-foreground mb-4">
                  When someone is interested in learning from you, their request will appear here.
                </p>
                <Button 
                  onClick={() => setActiveTab('create')}
                  variant="outline"
                >
                  Create a Skill Listing
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Teach;
