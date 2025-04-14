import React, { useState } from "react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/App";
import { Link } from "react-router-dom";
import {
  Clock,
  MapPin,
  GraduationCap,
  Star,
  Edit,
  ChevronDown,
  MessageSquare,
  Calendar as CalendarIcon,
  Video,
  Building,
  Award,
  CheckCircle,
} from "lucide-react";

const Profile: React.FC = () => {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState(
    "Full-stack developer with 5 years of experience specializing in React and Node.js. Passionate about teaching and helping others grow."
  );

  // Mock user data - in a real app, this would come from an API or context
  const userData = {
    name: "Jane Anderson",
    avatar: "/placeholder.svg",
    rating: 4.8,
    location: "San Francisco, CA",
    company: "Software Engineer at TechCorp",
    education: "Computer Science, Stanford",
    achievements: ["Top Teacher", "Verified Expert"],
    teachingSkills: ["JavaScript", "React", "Node.js", "Web Development"],
    learningSkills: ["Python", "Data Science", "Machine Learning"]
  };

  // Session availability times
  const availabilityTimes = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM", 
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "5:00 PM - 6:00 PM",
  ];

  // Reviews
  const reviews = [
    {
      id: 1,
      name: "John Doe",
      avatar: "/placeholder.svg",
      rating: 5,
      date: "2025-04-02",
      comment: "Excellent teacher! Very patient and explains complex concepts clearly.",
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar: "/placeholder.svg",
      rating: 4,
      date: "2025-03-28",
      comment: "Great session on React hooks. I learned so much in just one hour.",
    },
  ];

  // Session requests
  const sessionRequests = [
    {
      id: 1,
      student: "Alex Johnson",
      avatar: "/placeholder.svg",
      skill: "JavaScript",
      date: "2025-04-15",
      time: "10:00 AM - 11:00 AM",
      status: "pending",
    },
    {
      id: 2,
      student: "Sarah Williams",
      avatar: "/placeholder.svg",
      skill: "React",
      date: "2025-04-18",
      time: "2:00 PM - 3:00 PM",
      status: "pending",
    },
  ];

  // Upcoming sessions
  const upcomingSessions = [
    {
      id: 1,
      with: "Michael Brown",
      avatar: "/placeholder.svg",
      skill: "Node.js",
      date: "2025-04-14",
      time: "3:00 PM - 4:00 PM",
      role: "teacher",
    },
    {
      id: 2,
      with: "Emma Davis",
      avatar: "/placeholder.svg",
      skill: "Python",
      date: "2025-04-16",
      time: "5:00 PM - 6:00 PM",
      role: "student",
    },
  ];

  const handleSaveAvailability = () => {
    toast({
      title: "Availability saved",
      description: "Your availability has been updated successfully",
    });
  };

  const handleRequestAction = (id: number, action: "accept" | "decline") => {
    toast({
      title: action === "accept" ? "Request accepted" : "Request declined",
      description: action === "accept"
        ? "The session has been added to your schedule"
        : "The request has been declined",
    });
  };

  const handleSaveBio = () => {
    setEditingBio(false);
    toast({
      title: "Profile updated",
      description: "Your bio has been updated successfully",
    });
  };

  if (!isLoggedIn) {
    return null; // The App's routes will redirect to login
  }

  return (
    <ProfileLayout>
      <div className="container py-8">
        <ProfileHeader {...userData} />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left sidebar - now shown in ProfileHeader component */}
          
          {/* Main content */}
          <div className="md:col-span-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-6 w-full justify-start overflow-x-auto">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="schedule">Schedule & Availability</TabsTrigger>
                <TabsTrigger value="reviews">Reviews (12)</TabsTrigger>
                <TabsTrigger value="requests">Requests (3)</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>About Me</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setEditingBio(!editingBio)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingBio ? (
                      <div className="space-y-2">
                        <Textarea 
                          value={bio} 
                          onChange={(e) => setBio(e.target.value)}
                          rows={5}
                        />
                        <Button size="sm" onClick={handleSaveBio}>Save</Button>
                      </div>
                    ) : (
                      <p>{bio}</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Expertise Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userData.teachingSkills.map((skill) => (
                        <div key={skill} className="space-y-2">
                          <div className="flex justify-between">
                            <span className="font-medium">{skill}</span>
                            <span className="text-sm">Advanced</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full">
                            <div 
                              className="h-2 bg-skill-purple rounded-full" 
                              style={{ width: "85%" }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between border rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={session.avatar} alt="User avatar" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{session.with}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Badge variant="outline" className="mr-2">
                                  {session.role === "teacher" ? "Teaching" : "Learning"}
                                </Badge>
                                {session.skill}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {session.date}, {session.time}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Join
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>My Availability</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="date">Select date</Label>
                        <Calendar
                          mode="single"
                          selected={availabilityDate}
                          onSelect={setAvailabilityDate}
                          className="rounded-md border mt-2"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="font-medium">
                          Available times for {availabilityDate && format(availabilityDate, "MMMM d, yyyy")}
                        </h3>
                        <div className="space-y-2">
                          {availabilityTimes.map((time, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <input type="checkbox" id={`time-${index}`} className="h-4 w-4" />
                              <Label htmlFor={`time-${index}`} className="font-normal">
                                {time}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <div className="pt-4">
                          <Button onClick={handleSaveAvailability}>
                            Save Availability
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between border rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={session.avatar} alt="User avatar" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{session.with}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Badge variant="outline" className="mr-2">
                                  {session.role === "teacher" ? "Teaching" : "Learning"}
                                </Badge>
                                {session.skill}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {session.date}, {session.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Reschedule</Button>
                            <Button variant="outline" size="sm">Cancel</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Reviews from Students</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={review.avatar} alt="User avatar" />
                                <AvatarFallback>JD</AvatarFallback>
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

              <TabsContent value="requests">
                <Card>
                  <CardHeader>
                    <CardTitle>Session Requests</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {sessionRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between border rounded-lg p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={request.avatar} alt="User avatar" />
                              <AvatarFallback>JD</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{request.student}</h4>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Badge variant="outline" className="mr-2">Requested</Badge>
                                {request.skill}
                              </div>
                              <p className="text-sm text-muted-foreground flex items-center mt-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {request.date}, {request.time}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleRequestAction(request.id, "accept")}
                              className="bg-skill-purple hover:bg-skill-purple-dark"
                              size="sm"
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleRequestAction(request.id, "decline")}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default Profile;
