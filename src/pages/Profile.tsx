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
  X,
  Briefcase,
  GraduationCap,
  AwardIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ErrorBoundary from "@/components/ErrorBoundary";
import { supabase } from "@/integrations/supabase/client";

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
  experiences?: { id: string; title: string; company: string; startDate: string; endDate?: string; location: string; description?: string }[];
  educations?: { id: string; school: string; degree: string; field: string; startDate: string; endDate?: string }[];
  skills?: string[];
  headline?: string;
  website?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
}

const Profile: React.FC = () => {
  const { toast } = useToast();
  const { isLoggedIn, userId } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "profile");
  const [availabilityDate, setAvailabilityDate] = useState<Date | undefined>(new Date());
  const [editingBio, setEditingBio] = useState(false);
  const [bio, setBio] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  // User data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [teachingSkills, setTeachingSkills] = useState<string[]>([]);
  const [learningSkills, setLearningSkills] = useState<string[]>([]);

  // Session data state
  const [sessionRequests, setSessionRequests] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<Record<string, string[]>>({});
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  // Load user data from localStorage
  useEffect(() => {
    const storedUserData = localStorage.getItem("userData");
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData) as UserData;
      setUserData(parsedData);
      setBio(parsedData.bio || "");
      setExperiences(parsedData.experiences || []);
      setEducations(parsedData.educations || []);
      setSkills(parsedData.skills || []);
      setTeachingSkills(parsedData.teachingSkills || []);
      setLearningSkills(parsedData.learningSkills || []);

      // Initialize other sections if they don't exist
      if (!parsedData.experiences) {
        parsedData.experiences = [];
      }
      if (!parsedData.educations) {
        parsedData.educations = [];
      }
      if (!parsedData.skills) {
        parsedData.skills = [];
      }
      if (!parsedData.teachingSkills) {
        parsedData.teachingSkills = [];
      }
      if (!parsedData.learningSkills) {
        parsedData.learningSkills = [];
      }

      // Save the initialized data back to localStorage
      localStorage.setItem("userData", JSON.stringify(parsedData));
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
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const updatedSelectedTimes = {
        ...selectedTimes,
        [dateKey]: availabilityTimes.filter(time => {
          const checkbox = document.querySelector(`input[type="checkbox"][data-time="${time}"]`) as HTMLInputElement;
          return checkbox?.checked;
        })
      };
      setSelectedTimes(updatedSelectedTimes);

      // Save to localStorage
      const storedUserData = localStorage.getItem("userData");
      if (storedUserData) {
        const userData = JSON.parse(storedUserData);
        userData.availability = updatedSelectedTimes;
        localStorage.setItem("userData", JSON.stringify(userData));
      }

      toast({
        title: "Availability saved",
        description: "Your availability has been updated successfully",
      });
    }
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

  const handleSaveBio = async () => {
    setEditingBio(false);
    if (userData && userId) {
      try {
        // Update in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({ bio: bio })
          .eq('id', userId);
          
        if (error) throw error;
        
        // Update local state
        const updatedUserData = { ...userData, bio };
        localStorage.setItem("userData", JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
        
        toast({
          title: "Profile updated",
          description: "Your bio has been updated successfully",
        });
      } catch (error) {
        console.error('Error updating bio:', error);
        toast({
          title: "Error updating bio",
          description: "Failed to update your bio. Please try again.",
          variant: "destructive",
        });
      }
    }
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

  const handleUpdateProfile = async (profileData: any) => {
    if (userData && userId) {
      try {
        const [firstName, lastName] = profileData.name?.split(' ') || [userData.firstName, userData.lastName];

        // Update profile in Supabase
        const { error } = await supabase
          .from('profiles')
          .update({
            first_name: firstName || userData.firstName,
            last_name: lastName || userData.lastName,
            location: profileData.location || userData.location,
            occupation: profileData.company || userData.occupation,
            bio: profileData.bio || userData.bio
          })
          .eq('id', userId);
          
        if (error) throw error;

        const updatedUserData = {
          ...userData,
          firstName: firstName || userData.firstName,
          lastName: lastName || userData.lastName,
          location: profileData.location || userData.location,
          occupation: profileData.company || userData.occupation,
          bio: profileData.bio || userData.bio
        };

        // Save to localStorage
        localStorage.setItem("userData", JSON.stringify(updatedUserData));

        // Update state
        setUserData(updatedUserData);

        // Update individual states
        if (profileData.bio) {
          setBio(profileData.bio);
        }

        // Force a re-render of the ProfileHeader component
        const event = new CustomEvent('profileUpdated', {
          detail: {
            name: profileData.name,
            location: profileData.location,
            company: profileData.company,
            bio: profileData.bio
          }
        });
        window.dispatchEvent(event);

        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      } catch (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error updating profile",
          description: "Failed to update your profile. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        id: Date.now().toString(),
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        description: ""
      }
    ]);
  };

  const addEducation = () => {
    setEducations([
      ...educations,
      {
        id: Date.now().toString(),
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: ""
      }
    ]);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const updateExperience = (index: number, field: string, value: string) => {
    const newExperiences = [...experiences];
    newExperiences[index] = {
      ...newExperiences[index],
      [field]: value
    };
    setExperiences(newExperiences);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const newEducations = [...educations];
    newEducations[index] = {
      ...newEducations[index],
      [field]: value
    };
    setEducations(newEducations);
  };

  const removeExperience = (index: number) => {
    const newExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(newExperiences);
  };

  const removeEducation = (index: number) => {
    const newEducations = educations.filter((_, i) => i !== index);
    setEducations(newEducations);
  };

  const removeSkill = (index: number) => {
    const newSkills = skills.filter((_, i) => i !== index);
    setSkills(newSkills);
  };

  // Consolidate the session card into a reusable component
  const SessionCard = ({ session }: { session: any }) => (
    <div className="flex items-center justify-between border rounded-lg p-4">
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
  );

  // Consolidate the empty state message
  const EmptyState = ({ message, subMessage }: { message: string; subMessage: string }) => (
    <div className="text-center py-8 text-muted-foreground">
      <p>{message}</p>
      <p className="text-sm mt-2">{subMessage}</p>
    </div>
  );

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
    bio: userData.bio
  } : {
    name: "User",
    avatar: "/placeholder.svg",
    rating: 4.8,
    location: "",
    company: "",
    education: "",
    achievements: ["New Member"]
  };

  const saveExperiences = async () => {
    if (!userId) return;
    
    try {
      // First, delete all existing experiences
      const { error: deleteError } = await supabase
        .from('user_experiences')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Then insert the current experiences
      if (experiences.length > 0) {
        const experiencesToInsert = experiences.map(exp => ({
          user_id: userId,
          company: exp.company,
          position: exp.title,
          description: exp.description || '',
          start_date: exp.startDate || null,
          end_date: exp.endDate || null,
          current: !exp.endDate
        }));
        
        const { error: insertError } = await supabase
          .from('user_experiences')
          .insert(experiencesToInsert);
          
        if (insertError) throw insertError;
      }
      
      // Refresh user profile data
      // await refreshUserData();
      
      toast({
        title: "Experiences saved",
        description: "Your work experiences have been updated successfully",
      });
    } catch (error) {
      console.error('Error saving experiences:', error);
      toast({
        title: "Error saving experiences",
        description: "Failed to save your experiences. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveEducation = async () => {
    if (!userId) return;
    
    try {
      // First, delete all existing education entries
      const { error: deleteError } = await supabase
        .from('user_education')
        .delete()
        .eq('user_id', userId);
        
      if (deleteError) throw deleteError;
      
      // Then insert the current education entries
      if (educations.length > 0) {
        const educationsToInsert = educations.map(edu => ({
          user_id: userId,
          institution: edu.school,
          degree: edu.degree,
          field_of_study: edu.field || '',
          start_date: edu.startDate || null,
          end_date: edu.endDate || null,
          current: !edu.endDate
        }));
        
        const { error: insertError } = await supabase
          .from('user_education')
          .insert(educationsToInsert);
          
        if (insertError) throw insertError;
      }
      
      // Refresh user profile data
      // await refreshUserData();
      
      toast({
        title: "Education saved",
        description: "Your education information has been updated successfully",
      });
    } catch (error) {
      console.error('Error saving education:', error);
      toast({
        title: "Error saving education",
        description: "Failed to save your education. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Update the experience and education save handlers
  const handleSaveExperience = () => {
    setEditingExperience(false);
    saveExperiences();
  };

  const handleSaveEducation = () => {
    setEditingEducation(false);
    saveEducation();
  };

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        <ErrorBoundary>
          <ProfileHeader
            id={userData?.id}
            name={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
            avatar={userData?.avatar || "/placeholder.svg"}
            rating={4.8}
            location={userData?.location || ""}
            company={userData?.occupation || ""}
            education={userData?.education || ""}
            achievements={["New Member"]}
            bio={userData?.bio}
            isOwnProfile={true}
            onUpdateProfile={handleUpdateProfile}
            teachingSkills={teachingSkills}
            learningSkills={learningSkills}
            upcomingSessions={upcomingSessions}
            setActiveTab={setActiveTab}
          />
        </ErrorBoundary>

        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="requests">Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid grid-cols-1 gap-6">
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

                {/* Upcoming Sessions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {upcomingSessions.length > 0 ? (
                        upcomingSessions.map((session) => (
                          <SessionCard key={session.id} session={session} />
                        ))
                      ) : (
                        <EmptyState message="No upcoming sessions" subMessage="Book a session or wait for requests" />
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Experience Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        Experience
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingExperience(!editingExperience)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingExperience ? (
                      <div className="space-y-4">
                        {experiences.map((exp, index) => (
                          <div key={exp.id} className="space-y-4 p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Experience {index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeExperience(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-2">
                              <Label>Title</Label>
                              <Input
                                value={exp.title}
                                onChange={(e) => updateExperience(index, "title", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Company</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateExperience(index, "company", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Location</Label>
                              <Input
                                value={exp.location}
                                onChange={(e) => updateExperience(index, "location", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Input
                                  type="date"
                                  value={exp.startDate}
                                  onChange={(e) => updateExperience(index, "startDate", e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>End Date</Label>
                                <Input
                                  type="date"
                                  value={exp.endDate}
                                  onChange={(e) => updateExperience(index, "endDate", e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label>Description</Label>
                              <Textarea
                                value={exp.description}
                                onChange={(e) => updateExperience(index, "description", e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={addExperience}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                        <Button
                          onClick={handleSaveExperience}
                          className="w-full mt-2"
                        >
                          Save Experience
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {experiences.length > 0 ? (
                          experiences.map((exp) => (
                            <div key={exp.id} className="border-l-2 border-skill-purple pl-4">
                              <h4 className="font-medium">{exp.title}</h4>
                              <p className="text-sm text-muted-foreground">{exp.company}</p>
                              <p className="text-sm text-muted-foreground">
                                {exp.startDate} - {exp.endDate || 'Present'} • {exp.location}
                              </p>
                              {exp.description && (
                                <p className="text-sm mt-2">{exp.description}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No experience added yet</p>
                            <p className="text-sm mt-2">Add your work experience to showcase your expertise</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Education Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Education
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingEducation(!editingEducation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingEducation ? (
                      <div className="space-y-4">
                        {educations.map((edu, index) => (
                          <div key={edu.id} className="space-y-4 p-4 border rounded-lg">
                            <div className="flex justify-between items-center">
                              <h4 className="font-medium">Education {index + 1}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeEducation(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="grid gap-2">
                              <Label>School</Label>
                              <Input
                                value={edu.school}
                                onChange={(e) => updateEducation(index, "school", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Degree</Label>
                              <Input
                                value={edu.degree}
                                onChange={(e) => updateEducation(index, "degree", e.target.value)}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label>Field of Study</Label>
                              <Input
                                value={edu.field}
                                onChange={(e) => updateEducation(index, "field", e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label>Start Date</Label>
                                <Input
                                  type="date"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(index, "startDate", e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label>End Date</Label>
                                <Input
                                  type="date"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(index, "endDate", e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={addEducation}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Education
                        </Button>
                        <Button
                          onClick={handleSaveEducation}
                          className="w-full mt-2"
                        >
                          Save Education
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {educations.length > 0 ? (
                          educations.map((edu) => (
                            <div key={edu.id} className="border-l-2 border-skill-purple pl-4">
                              <h4 className="font-medium">{edu.school}</h4>
                              <p className="text-sm text-muted-foreground">{edu.degree} in {edu.field}</p>
                              <p className="text-sm text-muted-foreground">
                                {edu.startDate} - {edu.endDate || 'Present'}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No education added yet</p>
                            <p className="text-sm mt-2">Add your educational background to showcase your qualifications</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Skills Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <AwardIcon className="h-5 w-5" />
                        Skills
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSkills(!editingSkills)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingSkills ? (
                      <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="flex items-center gap-1">
                              {skill}
                              <button
                                onClick={() => removeSkill(index)}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a skill"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && newSkill.trim()) {
                                addSkill();
                              }
                            }}
                          />
                          <Button onClick={addSkill}>
                            Add
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills.length > 0 ? (
                          skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <p>No skills added yet</p>
                            <p className="text-sm mt-2">Add your skills to showcase your expertise</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Set Your Schedule</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="rounded-md border mt-2"
                        />
                      </div>

                      {selectedDate && (
                        <div className="space-y-2">
                          <Label>Available Times for {format(selectedDate, "MMMM d, yyyy")}</Label>
                          <div className="space-y-2">
                            {availabilityTimes.map((time) => {
                              const dateKey = selectedDate.toISOString().split('T')[0];
                              const isSelected = selectedTimes[dateKey]?.includes(time);
                              return (
                                <div key={time} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`time-${time}`}
                                    data-time={time}
                                    checked={isSelected}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                      const dateKey = selectedDate.toISOString().split('T')[0];
                                      const updatedTimes = selectedTimes[dateKey] || [];
                                      if (e.target.checked) {
                                        updatedTimes.push(time);
                                      } else {
                                        const index = updatedTimes.indexOf(time);
                                        if (index > -1) {
                                          updatedTimes.splice(index, 1);
                                        }
                                      }
                                      setSelectedTimes({
                                        ...selectedTimes,
                                        [dateKey]: updatedTimes
                                      });
                                    }}
                                    className="h-4 w-4"
                                  />
                                  <Label htmlFor={`time-${time}`}>{time}</Label>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button onClick={handleSaveAvailability} className="w-full">
                          Save Schedule
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingExperience(false);
                            setEditingEducation(false);
                            setEditingSkills(false);
                          }}
                          className="w-full mt-
