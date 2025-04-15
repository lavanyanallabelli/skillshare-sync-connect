
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/App";
import { supabase } from "@/integrations/supabase/client";
import {
  Clock,
  Calendar as CalendarIcon,
  Star,
  MessageSquare,
  UserPlus,
  UserCheck,
  Clock as PendingIcon
} from "lucide-react";

// Sample teacher data
const teacherData = {
  id: "32",
  name: "Alex Chen",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  rating: 4.8,
  location: "New York, USA",
  company: "Tech Innovators",
  education: "Computer Science, MIT",
  achievements: ["Top Rated", "Verified Teacher"],
  bio: "I'm a full-stack developer with over 8 years of experience in web and mobile application development. I specialize in React, Node.js, and TypeScript and love sharing my knowledge with others.",
  teachingSkills: ["JavaScript", "React", "Node.js", "TypeScript", "Web Development"],
  learningSkills: ["Flutter", "Go", "Machine Learning"]
};

// Sample reviews data
const reviewsData = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    date: "April 10, 2025",
    comment: "Alex is an amazing teacher! His explanations are clear and he's very patient. I learned so much about React and JavaScript in just a few sessions."
  },
  {
    id: 2,
    name: "Michael Brown",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    rating: 4,
    date: "March 27, 2025",
    comment: "Great experience learning TypeScript with Alex. He has deep knowledge and provides practical examples that helped me understand complex concepts."
  }
];

const TeacherProfile = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const { isLoggedIn, userId } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSkill, setSelectedSkill] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [teacher, setTeacher] = useState(teacherData);
  const [reviews, setReviews] = useState(reviewsData);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sample availability times
  const availabilityTimes = [
    "9:00 AM - 10:00 AM",
    "10:30 AM - 11:30 AM",
    "1:00 PM - 2:00 PM",
    "3:30 PM - 4:30 PM",
    "5:00 PM - 6:00 PM",
  ];

  useEffect(() => {
    // In a real app, we would fetch the teacher data from the API using the ID
    // For now, we'll use the mock data
    
    const checkConnectionStatus = async () => {
      if (!isLoggedIn || !userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        // Check if there's a connection between the current user and the teacher
        const { data, error } = await supabase
          .from('connections')
          .select('*')
          .or(`and(requester_id.eq.${userId},recipient_id.eq.${id}),and(requester_id.eq.${id},recipient_id.eq.${userId})`)
          .single();
          
        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error;
        }
        
        if (data) {
          setConnectionStatus(data.status);
        } else {
          setConnectionStatus(null);
        }
      } catch (error) {
        console.error("Error checking connection status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnectionStatus();
  }, [id, isLoggedIn, userId]);

  const handleConnect = async () => {
    if (!isLoggedIn) {
      toast({
        title: "Login Required",
        description: "Please log in to connect with teachers",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Insert a new connection request
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: userId,
          recipient_id: id,
          status: 'pending'
        });
        
      if (error) {
        if (error.code === '23505') { // Unique violation
          toast({
            title: "Already Connected",
            description: "You have already sent a connection request to this teacher",
          });
        } else {
          throw error;
        }
      } else {
        setConnectionStatus('pending');
        
        toast({
          title: "Connection Request Sent!",
          description: "Your connection request has been sent to the teacher.",
        });
      }
    } catch (error) {
      console.error("Error connecting:", error);
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBookSession = () => {
    if (!selectedSkill) {
      toast({
        title: "Skill Required",
        description: "Please select a skill you want to learn",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedTimeSlot) {
      toast({
        title: "Time Slot Required",
        description: "Please select a time slot for your session",
        variant: "destructive",
      });
      return;
    }
    
    // In a real app, we would make an API call to book the session
    toast({
      title: "Session Requested",
      description: `Your learning request has been sent to ${teacher.name}`,
    });
    
    setDialogOpen(false);
    setSelectedSkill("");
    setSelectedTimeSlot("");
  };

  return (
    <MainLayout>
      <div className="container max-w-6xl py-8">
        <ProfileHeader
          {...teacher}
          isOwnProfile={false}
          actionButton={
            isLoading ? (
              <Button disabled>
                <PendingIcon className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </Button>
            ) : connectionStatus === 'accepted' ? (
              <Button className="bg-green-500 hover:bg-green-600" disabled>
                <UserCheck className="mr-2 h-4 w-4" />
                Connected
              </Button>
            ) : connectionStatus === 'pending' ? (
              <Button variant="outline" disabled>
                <PendingIcon className="mr-2 h-4 w-4" />
                Request Pending
              </Button>
            ) : (
              <Button onClick={handleConnect} className="bg-skill-purple hover:bg-skill-purple-dark">
                <UserPlus className="mr-2 h-4 w-4" />
                Connect
              </Button>
            )
          }
        />

        <div className="mt-8">
          <Tabs defaultValue="skills" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="skills">Skills & Expertise</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="skills">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Teach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {teacher.teachingSkills.map((skill) => (
                        <Badge key={skill} className="py-2 px-3">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark">
                            Book a Learning Session
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Book a Learning Session</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div>
                              <Label>Select a skill you want to learn</Label>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {teacher.teachingSkills.map((skill) => (
                                  <Badge
                                    key={skill}
                                    variant={selectedSkill === skill ? "default" : "outline"}
                                    className="py-2 px-3 cursor-pointer transition-colors"
                                    onClick={() => setSelectedSkill(skill)}
                                  >
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label>Select a date</Label>
                              <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md border mt-2"
                                disabled={(date) => 
                                  date < new Date() || 
                                  date > new Date(new Date().setDate(new Date().getDate() + 30))
                                }
                              />
                            </div>
                            
                            <div>
                              <Label>
                                Available times for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                              </Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {availabilityTimes.map((time) => (
                                  <Badge
                                    key={time}
                                    variant={selectedTimeSlot === time ? "default" : "outline"}
                                    className="py-2 px-3 cursor-pointer text-center"
                                    onClick={() => setSelectedTimeSlot(time)}
                                  >
                                    {time}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            
                            <div className="pt-4 flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleBookSession} className="bg-skill-purple">
                                Send Request
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Skills I'm Learning</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {teacher.learningSkills.map((skill) => (
                        <Badge key={skill} variant="secondary" className="py-2 px-3">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-6">
                      <Button className="w-full" variant="outline">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Send Message
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b pb-6 last:border-0">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={review.avatar} alt={review.name} />
                              <AvatarFallback>
                                {review.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{review.name}</h4>
                              <div className="flex items-center mt-1">
                                {Array(5).fill(0).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{review.date}</span>
                        </div>
                        <p className="mt-3">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Teaching Availability</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="date">Select date</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border mt-2"
                        disabled={(date) => 
                          date < new Date() || 
                          date > new Date(new Date().setDate(new Date().getDate() + 30))
                        }
                      />
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">
                        Available times for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                      </h3>
                      <div className="space-y-2">
                        {availabilityTimes.map((time, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{time}</span>
                            <Button 
                              className="ml-auto bg-skill-purple hover:bg-skill-purple-dark" 
                              size="sm"
                              onClick={() => {
                                setSelectedTimeSlot(time);
                                setDialogOpen(true);
                              }}
                            >
                              Book
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default TeacherProfile;
