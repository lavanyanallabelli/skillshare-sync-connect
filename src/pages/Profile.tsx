
import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  BookOpen,
  Briefcase,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  Edit,
  Save,
  PenTool,
  Inbox,
  Send
} from "lucide-react";

// Sample data
const userData = {
  name: "John Smith",
  title: "Software Developer",
  location: "San Francisco, CA",
  email: "john.smith@example.com",
  phone: "+1 (555) 123-4567",
  website: "johnsmith.dev",
  bio: "Passionate software developer with 5 years of experience. Love to teach and learn new technologies.",
  avatar: "https://randomuser.me/api/portraits/men/44.jpg",
};

const initialTeachingSkills = [
  { id: 1, name: "JavaScript", level: "Advanced", description: "Modern JavaScript including ES6+ features" },
  { id: 2, name: "React", level: "Intermediate", description: "Component architecture, hooks, and state management" },
];

const initialLearningSkills = [
  { id: 1, name: "Python", level: "Beginner", description: "Basic syntax and data structures" },
  { id: 2, name: "Machine Learning", level: "Beginner", description: "Fundamentals and algorithms" },
];

const requests = [
  { 
    id: 1, 
    type: "received", 
    from: "Sarah Johnson", 
    skill: "JavaScript", 
    message: "Hi, I'd like to learn JavaScript from you. Are you available?", 
    status: "pending", 
    avatar: "https://randomuser.me/api/portraits/women/44.jpg" 
  },
  { 
    id: 2, 
    type: "sent", 
    to: "Michael Chen", 
    skill: "Python", 
    message: "Hello, I'm interested in learning Python. Can you teach me?", 
    status: "accepted", 
    avatar: "https://randomuser.me/api/portraits/men/32.jpg" 
  },
];

const availabilitySlots = [
  { id: 1, day: "Monday", startTime: "10:00", endTime: "12:00" },
  { id: 2, day: "Wednesday", startTime: "14:00", endTime: "16:00" },
  { id: 3, day: "Friday", startTime: "09:00", endTime: "11:00" },
];

const Profile: React.FC = () => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(false);
  const [teachingSkills, setTeachingSkills] = useState(initialTeachingSkills);
  const [learningSkills, setLearningSkills] = useState(initialLearningSkills);
  const [newTeachingSkill, setNewTeachingSkill] = useState({ name: "", level: "Beginner", description: "" });
  const [newLearningSkill, setNewLearningSkill] = useState({ name: "", level: "Beginner", description: "" });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [newSlot, setNewSlot] = useState({ day: "", startTime: "", endTime: "" });
  const [availability, setAvailability] = useState(availabilitySlots);
  
  const handleAddTeachingSkill = () => {
    if (newTeachingSkill.name && newTeachingSkill.description) {
      setTeachingSkills([
        ...teachingSkills,
        { 
          id: teachingSkills.length + 1, 
          name: newTeachingSkill.name, 
          level: newTeachingSkill.level, 
          description: newTeachingSkill.description 
        }
      ]);
      setNewTeachingSkill({ name: "", level: "Beginner", description: "" });
      toast({
        title: "Skill Added",
        description: "Your teaching skill has been added successfully."
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    }
  };

  const handleAddLearningSkill = () => {
    if (newLearningSkill.name && newLearningSkill.description) {
      setLearningSkills([
        ...learningSkills,
        { 
          id: learningSkills.length + 1, 
          name: newLearningSkill.name, 
          level: newLearningSkill.level, 
          description: newLearningSkill.description 
        }
      ]);
      setNewLearningSkill({ name: "", level: "Beginner", description: "" });
      toast({
        title: "Skill Added",
        description: "Your learning skill has been added successfully."
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    }
  };

  const handleRemoveTeachingSkill = (id: number) => {
    setTeachingSkills(teachingSkills.filter(skill => skill.id !== id));
    toast({
      title: "Skill Removed",
      description: "Your teaching skill has been removed."
    });
  };

  const handleRemoveLearningSkill = (id: number) => {
    setLearningSkills(learningSkills.filter(skill => skill.id !== id));
    toast({
      title: "Skill Removed",
      description: "Your learning skill has been removed."
    });
  };

  const handleAddAvailability = () => {
    if (newSlot.day && newSlot.startTime && newSlot.endTime) {
      setAvailability([
        ...availability,
        { 
          id: availability.length + 1, 
          day: newSlot.day, 
          startTime: newSlot.startTime, 
          endTime: newSlot.endTime 
        }
      ]);
      setNewSlot({ day: "", startTime: "", endTime: "" });
      toast({
        title: "Availability Added",
        description: "Your availability slot has been added successfully."
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in all availability fields",
        variant: "destructive",
      });
    }
  };

  const handleRemoveAvailability = (id: number) => {
    setAvailability(availability.filter(slot => slot.id !== id));
    toast({
      title: "Availability Removed",
      description: "Your availability slot has been removed."
    });
  };

  const handleRequestAction = (id: number, action: "accept" | "reject" | "cancel") => {
    // In a real application, this would update the request status in the database
    toast({
      title: action === "accept" ? "Request Accepted" : action === "reject" ? "Request Rejected" : "Request Cancelled",
      description: `The request has been ${action === "accept" ? "accepted" : action === "reject" ? "rejected" : "cancelled"}.`
    });
  };

  return (
    <MainLayout>
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <img 
                      src={userData.avatar} 
                      alt={userData.name} 
                      className="h-32 w-32 rounded-full object-cover"
                    />
                    {editMode && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="absolute bottom-0 right-0 rounded-full p-2"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="text-muted-foreground">{userData.title}</p>
                  
                  <div className="flex items-center mt-2 text-muted-foreground">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{userData.location}</span>
                  </div>
                  
                  <div className="w-full mt-6 space-y-3">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-muted-foreground" />
                      <span>{userData.email}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone size={16} className="mr-2 text-muted-foreground" />
                      <span>{userData.phone}</span>
                    </div>
                    <div className="flex items-center">
                      <Globe size={16} className="mr-2 text-muted-foreground" />
                      <span>{userData.website}</span>
                    </div>
                  </div>
                  
                  <div className="w-full mt-6">
                    <h3 className="font-medium mb-2">Bio</h3>
                    <p className="text-sm text-muted-foreground">
                      {userData.bio}
                    </p>
                  </div>
                  
                  <div className="w-full mt-6">
                    {editMode ? (
                      <Button 
                        className="w-full bg-skill-purple hover:bg-skill-purple-dark"
                        onClick={() => setEditMode(false)}
                      >
                        <Save size={16} className="mr-2" />
                        Save Profile
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-skill-purple hover:bg-skill-purple-dark"
                        onClick={() => setEditMode(true)}
                      >
                        <Edit size={16} className="mr-2" />
                        Edit Profile
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Availability</CardTitle>
                <CardDescription>Set your teaching availability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="day">Day</Label>
                        <select 
                          id="day"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={newSlot.day}
                          onChange={(e) => setNewSlot({...newSlot, day: e.target.value})}
                        >
                          <option value="">Select day</option>
                          <option value="Monday">Monday</option>
                          <option value="Tuesday">Tuesday</option>
                          <option value="Wednesday">Wednesday</option>
                          <option value="Thursday">Thursday</option>
                          <option value="Friday">Friday</option>
                          <option value="Saturday">Saturday</option>
                          <option value="Sunday">Sunday</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input 
                          id="startTime" 
                          type="time" 
                          value={newSlot.startTime}
                          onChange={(e) => setNewSlot({...newSlot, startTime: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="endTime">End Time</Label>
                        <Input 
                          id="endTime" 
                          type="time" 
                          value={newSlot.endTime}
                          onChange={(e) => setNewSlot({...newSlot, endTime: e.target.value})}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button 
                          className="w-full bg-skill-purple hover:bg-skill-purple-dark"
                          onClick={handleAddAvailability}
                        >
                          Add Slot
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <h3 className="text-sm font-medium">Current Availability</h3>
                    {availability.length > 0 ? (
                      <div className="space-y-2">
                        {availability.map((slot) => (
                          <div 
                            key={slot.id} 
                            className="flex items-center justify-between p-2 bg-muted rounded-md"
                          >
                            <div>
                              <span className="font-medium">{slot.day}: </span>
                              <span>{slot.startTime} - {slot.endTime}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveAvailability(slot.id)}
                            >
                              <X size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No availability slots added yet.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Section */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="skills" className="space-y-8">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="skills">Skills</TabsTrigger>
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Can Teach</CardTitle>
                    <CardDescription>Skills you are willing to teach others</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="skillName">Skill Name</Label>
                          <Input 
                            id="skillName" 
                            placeholder="e.g. JavaScript" 
                            value={newTeachingSkill.name}
                            onChange={(e) => setNewTeachingSkill({...newTeachingSkill, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="skillLevel">Proficiency Level</Label>
                          <select 
                            id="skillLevel"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newTeachingSkill.level}
                            onChange={(e) => setNewTeachingSkill({...newTeachingSkill, level: e.target.value})}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="Expert">Expert</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="skillDescription">Description</Label>
                        <Textarea 
                          id="skillDescription" 
                          placeholder="Describe what aspects of this skill you can teach..." 
                          value={newTeachingSkill.description}
                          onChange={(e) => setNewTeachingSkill({...newTeachingSkill, description: e.target.value})}
                        />
                      </div>
                      <Button 
                        className="w-full bg-skill-purple hover:bg-skill-purple-dark"
                        onClick={handleAddTeachingSkill}
                      >
                        <Plus size={16} className="mr-2" />
                        Add Teaching Skill
                      </Button>
                    </div>

                    <div className="mt-6 space-y-4">
                      <h3 className="text-sm font-medium">My Teaching Skills</h3>
                      {teachingSkills.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {teachingSkills.map((skill) => (
                            <Card key={skill.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{skill.name}</h4>
                                    <Badge variant="outline" className="mt-1">
                                      {skill.level}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {skill.description}
                                    </p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRemoveTeachingSkill(skill.id)}
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No teaching skills added yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Skills I Want to Learn</CardTitle>
                    <CardDescription>Skills you are interested in learning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="learnSkillName">Skill Name</Label>
                          <Input 
                            id="learnSkillName" 
                            placeholder="e.g. Python" 
                            value={newLearningSkill.name}
                            onChange={(e) => setNewLearningSkill({...newLearningSkill, name: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="learnSkillLevel">Current Level</Label>
                          <select 
                            id="learnSkillLevel"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={newLearningSkill.level}
                            onChange={(e) => setNewLearningSkill({...newLearningSkill, level: e.target.value})}
                          >
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="learnSkillDescription">Description</Label>
                        <Textarea 
                          id="learnSkillDescription" 
                          placeholder="Describe what you want to learn about this skill..." 
                          value={newLearningSkill.description}
                          onChange={(e) => setNewLearningSkill({...newLearningSkill, description: e.target.value})}
                        />
                      </div>
                      <Button 
                        className="w-full bg-skill-purple hover:bg-skill-purple-dark"
                        onClick={handleAddLearningSkill}
                      >
                        <Plus size={16} className="mr-2" />
                        Add Learning Skill
                      </Button>
                    </div>

                    <div className="mt-6 space-y-4">
                      <h3 className="text-sm font-medium">My Learning Skills</h3>
                      {learningSkills.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {learningSkills.map((skill) => (
                            <Card key={skill.id}>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{skill.name}</h4>
                                    <Badge variant="outline" className="mt-1">
                                      {skill.level}
                                    </Badge>
                                    <p className="text-sm text-muted-foreground mt-2">
                                      {skill.description}
                                    </p>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRemoveLearningSkill(skill.id)}
                                  >
                                    <X size={16} />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No learning skills added yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Requests Tab */}
              <TabsContent value="requests" className="space-y-6">
                <Tabs defaultValue="received" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="received" className="flex items-center gap-2">
                      <Inbox size={16} />
                      Received Requests
                    </TabsTrigger>
                    <TabsTrigger value="sent" className="flex items-center gap-2">
                      <Send size={16} />
                      Sent Requests
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="received" className="mt-4 space-y-4">
                    {requests.filter(r => r.type === "received").length > 0 ? (
                      requests.filter(r => r.type === "received").map((request) => (
                        <Card key={request.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <img 
                                src={request.avatar} 
                                alt={request.from} 
                                className="h-12 w-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{request.from}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Skill: <Badge variant="outline">{request.skill}</Badge>
                                    </p>
                                  </div>
                                  <Badge className={
                                    request.status === "pending" ? "bg-amber-500" : 
                                    request.status === "accepted" ? "bg-green-500" : 
                                    "bg-red-500"
                                  }>
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm">
                                  {request.message}
                                </p>
                                {request.status === "pending" && (
                                  <div className="flex gap-2 mt-4">
                                    <Button 
                                      size="sm"
                                      className="bg-green-500 hover:bg-green-600"
                                      onClick={() => handleRequestAction(request.id, "accept")}
                                    >
                                      Accept
                                    </Button>
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="text-red-500 border-red-500 hover:bg-red-50"
                                      onClick={() => handleRequestAction(request.id, "reject")}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center p-8 bg-muted rounded-lg">
                        <h3 className="font-medium mb-2">No requests received</h3>
                        <p className="text-sm text-muted-foreground">
                          When someone sends you a teaching request, it will appear here.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="sent" className="mt-4 space-y-4">
                    {requests.filter(r => r.type === "sent").length > 0 ? (
                      requests.filter(r => r.type === "sent").map((request) => (
                        <Card key={request.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <img 
                                src={request.avatar} 
                                alt={request.to} 
                                className="h-12 w-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{request.to}</h4>
                                    <p className="text-sm text-muted-foreground">
                                      Skill: <Badge variant="outline">{request.skill}</Badge>
                                    </p>
                                  </div>
                                  <Badge className={
                                    request.status === "pending" ? "bg-amber-500" : 
                                    request.status === "accepted" ? "bg-green-500" : 
                                    "bg-red-500"
                                  }>
                                    {request.status}
                                  </Badge>
                                </div>
                                <p className="mt-2 text-sm">
                                  {request.message}
                                </p>
                                {request.status === "pending" && (
                                  <div className="flex justify-end mt-4">
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="text-red-500 border-red-500 hover:bg-red-50"
                                      onClick={() => handleRequestAction(request.id, "cancel")}
                                    >
                                      Cancel Request
                                    </Button>
                                  </div>
                                )}
                                {request.status === "accepted" && (
                                  <div className="flex justify-end mt-4">
                                    <Link to="/messages">
                                      <Button 
                                        size="sm"
                                        className="bg-skill-purple hover:bg-skill-purple-dark"
                                      >
                                        Message
                                      </Button>
                                    </Link>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center p-8 bg-muted rounded-lg">
                        <h3 className="font-medium mb-2">No requests sent</h3>
                        <p className="text-sm text-muted-foreground">
                          You haven't sent any learning requests yet. Browse the explore page to find teachers.
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Messages</CardTitle>
                    <CardDescription>
                      Manage your conversations with teachers and students
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <Link to="/messages">
                      <Button className="w-full bg-skill-purple hover:bg-skill-purple-dark">
                        Go to Messages
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
