
import React, { useState, useEffect } from "react";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/App";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock,
  MapPin,
  Star,
  Edit,
  Calendar as CalendarIcon,
  Video,
  Save,
  CheckCircle,
  Plus,
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  location: string;
  occupation: string;
  education: string;
  teachingSkills: string[];
  learningSkills: string[];
  avatar: string;
  createdAt: string;
}

const Profile: React.FC = () => {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "profile");
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [showSkillSaveButton, setShowSkillSaveButton] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [teachingSkills, setTeachingSkills] = useState<string[]>([]);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<Record<string, string>>({});

  // Session data state - empty by default for new users
  const [sessionRequests, setSessionRequests] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);

  // Load user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData) as UserData;
      setUserData(parsedData);
      setBio(parsedData.bio || "");
      setTeachingSkills(parsedData.teachingSkills || []);
      setLearningSkills(parsedData.learningSkills || []);
      
      // Initialize skill levels
      const initialSkillLevels: Record<string, string> = {};
      parsedData.teachingSkills?.forEach(skill => {
        initialSkillLevels[skill] = "Intermediate";
      });
      setSkillLevels(initialSkillLevels);
    }
  }, []);

  // Session availability times
  const availabilityTimes = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM", 
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "5:00 PM - 6:00 PM",
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
    
    // Update session requests by removing the one that was acted upon
    setSessionRequests(prevRequests => prevRequests.filter(request => request.id !== id));
  };

  const handleSaveBio = () => {
    setEditingBio(false);
    if (userData) {
      const updatedUserData = { ...userData, bio };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
    }
    toast({
      title: "Profile updated",
      description: "Your bio has been updated successfully",
    });
  };

  const handleSaveSkills = () => {
    setShowSkillSaveButton(false);
    if (userData) {
      const updatedUserData = { 
        ...userData, 
        teachingSkills, 
        learningSkills 
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
    }
    toast({
      title: "Skills updated",
      description: "Your skills have been updated successfully",
    });
  };

  const handleRemoveTeachingSkill = (skill: string) => {
    setTeachingSkills(prev => prev.filter(s => s !== skill));
    setShowSkillSaveButton(true);
  };

  const handleRemoveLearningSkill = (skill: string) => {
    setLearningSkills(prev => prev.filter(s => s !== skill));
    setShowSkillSaveButton(true);
  };

  const handleAddTeachingSkill = (skill: string) => {
    if (!teachingSkills.includes(skill)) {
      setTeachingSkills([...teachingSkills, skill]);
      setSkillLevels(prev => ({...prev, [skill]: "Intermediate"}));
      setShowSkillSaveButton(true);
    }
  };

  const handleAddLearningSkill = (skill: string) => {
    if (!learningSkills.includes(skill)) {
      setLearningSkills([...learningSkills, skill]);
      setShowSkillSaveButton(true);
    }
  };

  const handleUpdateSkillLevel = (skill: string, level: string) => {
    setSkillLevels(prev => ({...prev, [skill]: level}));
    setShowSkillSaveButton(true);
  };

  const handleBookSession = (session: any) => {
    setSelectedSession(session);
    setDialogOpen(true);
  };

  const confirmBooking = () => {
    setDialogOpen(false);
    toast({
      title: "Session booked",
      description: `Your session with ${selectedSession.with} has been booked successfully`,
    });
  };

  const handleUpdateProfile = (profileData: any) => {
    if (userData) {
      const updatedUserData = { 
        ...userData,
        firstName: profileData.name.split(' ')[0] || userData.firstName,
        lastName: profileData.name.split(' ')[1] || userData.lastName,
        location: profileData.location,
        occupation: profileData.company,
        education: profileData.education,
        bio: profileData.bio
      };
      localStorage.setItem("userData", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setBio(profileData.bio);
    }
  };

  if (!isLoggedIn) {
    return null; // The App's routes will redirect to login
  }

  // Create a formatted profile object for the ProfileHeader component
  const profileData = userData ? {
    id: userData.id,
    name: `${userData.firstName} ${userData.lastName}`,
    avatar: userData.avatar || "/placeholder.svg",
    rating: 4.8, // Default rating
    location: userData.location,
    company: userData.occupation,
    education: userData.education,
    achievements: ["New Member"],
    teachingSkills,
    learningSkills,
    bio: userData.bio
  } : {
    name: "User",
    avatar: "/placeholder.svg",
    rating: 4.8,
    location: "",
    company: "",
    education: "",
    achievements: ["New Member"],
    teachingSkills: [],
    learningSkills: []
  };

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        <ProfileHeader 
          {...profileData} 
          isOwnProfile={true} 
          onUpdateProfile={handleUpdateProfile}
        />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="schedule">Schedule & Availability</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          className="resize-none"
                          placeholder="Tell us about yourself, your interests, and what you want to learn or teach"
                        />
                        <Button size="sm" onClick={handleSaveBio} className="flex items-center gap-1">
                          <Save className="h-4 w-4" /> Save
                        </Button>
                      </div>
                    ) : (
                      <p className="text-gray-700">
                        {bio || "Add information about yourself, your interests, and what you want to learn or teach."}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingSessions.length > 0 ? (
                        upcomingSessions.map((session) => (
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
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No upcoming sessions</p>
                          <p className="text-sm mt-2">Book a session or wait for requests</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="skills">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Teach</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teachingSkills.length > 0 ? (
                        teachingSkills.map((skill) => (
                          <div key={skill} className="border rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium">{skill}</h4>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveTeachingSkill(skill)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`level-${skill}`}>Proficiency level</Label>
                              <select
                                id={`level-${skill}`}
                                className="w-full rounded-md border border-input bg-background px-3 py-2"
                                value={skillLevels[skill] || "Intermediate"}
                                onChange={(e) => handleUpdateSkillLevel(skill, e.target.value)}
                              >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                                <option value="Expert">Expert</option>
                              </select>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No teaching skills added yet</p>
                          <p className="text-sm mt-2">Add skills you can teach to others</p>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setActiveTab("add-skills")}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add More Teaching Skills
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Want to Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {learningSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {learningSkills.map((skill) => (
                            <Badge key={skill} variant="secondary" className="p-2 text-base">
                              {skill}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleRemoveLearningSkill(skill)}
                                className="h-4 w-4 p-0 ml-2"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <p>No learning skills added yet</p>
                          <p className="text-sm mt-2">Add skills you want to learn</p>
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => setActiveTab("add-skills")}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add More Learning Skills
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {showSkillSaveButton && (
                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    <Button className="bg-skill-purple" onClick={handleSaveSkills}>
                      <Save className="h-4 w-4 mr-2" /> Save Skills
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="add-skills">
              <Card>
                <CardHeader>
                  <CardTitle>Add Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4">Popular Teaching Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {["TypeScript", "Vue.js", "Angular", "React Native", "GraphQL", "AWS", "Docker"].map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-secondary transition-colors p-2"
                            onClick={() => handleAddTeachingSkill(skill)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-4">Popular Learning Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {["Swift", "Kotlin", "Flutter", "Rust", "Go", "TensorFlow", "UI/UX Design"].map((skill) => (
                          <Badge 
                            key={skill} 
                            variant="outline" 
                            className="cursor-pointer hover:bg-secondary transition-colors p-2"
                            onClick={() => handleAddLearningSkill(skill)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("skills")}>Cancel</Button>
                  <Button className="bg-skill-purple" onClick={() => {
                    handleSaveSkills();
                    setActiveTab("skills");
                  }}>
                    <Save className="h-4 w-4 mr-2" /> Save Changes
                  </Button>
                </CardFooter>
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
                        <Button onClick={handleSaveAvailability} className="bg-skill-purple">
                          <Save className="h-4 w-4 mr-2" /> Save Availability
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
                    {upcomingSessions.length > 0 ? (
                      upcomingSessions.map((session) => (
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
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>No upcoming sessions</p>
                        <p className="text-sm mt-2">Schedule a session or accept a request to see it here</p>
                      </div>
                    )}
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
                  {reviews.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No reviews yet</p>
                      <p className="text-sm mt-2">Once you teach others, they can leave reviews here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card>
                <CardHeader>
                  <CardTitle>Session Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionRequests.length > 0 ? (
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
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No pending requests</p>
                      <p className="text-sm mt-2">When someone wants to learn from you, their request will appear here</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Session</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedSession && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedSession.avatar} alt="User avatar" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{selectedSession.with}</h4>
                    <p className="text-sm text-muted-foreground">{selectedSession.skill}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Date</Label>
                    <div className="mt-1 font-medium">{selectedSession.date}</div>
                  </div>
                  <div>
                    <Label>Time</Label>
                    <div className="mt-1 font-medium">{selectedSession.time}</div>
                  </div>
                </div>
                <div className="pt-4 space-x-2 flex justify-end">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button className="bg-skill-purple" onClick={confirmBooking}>Confirm Booking</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </ProfileLayout>
  );
};

export default Profile;
