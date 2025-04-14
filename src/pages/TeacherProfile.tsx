
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileLayout from "@/components/layout/ProfileLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Video, Star, Calendar as CalendarIcon, Clock, Mail, Phone } from "lucide-react";

// Mock teacher data - in a real app, this would be fetched from an API based on the ID
const teachersData = {
  "32": {
    id: "32",
    name: "Alex Chen",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 4.8,
    location: "New York, NY",
    company: "Professional Photographer",
    education: "BFA in Photography, NYU",
    contact: {
      email: "alex.chen@example.com",
      phone: "+1 (555) 123-4567"
    },
    bio: "Professional photographer with 10+ years of experience. I specialize in portrait and landscape photography and love teaching beginners the fundamentals of digital photography.",
    achievements: ["Top Teacher", "Verified Expert"],
    teachingSkills: ["Digital Photography", "Photo Editing", "Composition", "Lighting"],
    learningSkills: ["Videography", "Film Production"],
    reviews: [
      {
        id: 1,
        name: "Jamie Smith",
        avatar: "/placeholder.svg",
        rating: 5,
        date: "2025-03-15",
        comment: "Alex is an amazing teacher! He explains concepts in an easy-to-understand way and provides helpful feedback on assignments."
      },
      {
        id: 2,
        name: "Taylor Johnson",
        avatar: "/placeholder.svg",
        rating: 4,
        date: "2025-02-28",
        comment: "Great course on photography basics. I learned so much in just a few weeks."
      }
    ],
    availability: [
      { day: "Monday", slots: ["10:00 AM - 11:00 AM", "2:00 PM - 3:00 PM"] },
      { day: "Wednesday", slots: ["1:00 PM - 2:00 PM", "5:00 PM - 6:00 PM"] },
      { day: "Friday", slots: ["9:00 AM - 10:00 AM", "3:00 PM - 4:00 PM"] }
    ]
  },
  "44": {
    id: "44",
    name: "Sarah Williams",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 4.6,
    location: "San Francisco, CA",
    company: "Senior Developer at TechCorp",
    education: "Computer Science, Stanford",
    contact: {
      email: "sarah.williams@example.com",
      phone: "+1 (555) 987-6543"
    },
    bio: "Full-stack developer with expertise in React and Node.js. I enjoy breaking down complex programming concepts for beginners and helping them build their first applications.",
    achievements: ["Top Rated", "500+ Students"],
    teachingSkills: ["JavaScript", "React", "Node.js", "Web Development"],
    learningSkills: ["Python", "Machine Learning"],
    reviews: [
      {
        id: 1,
        name: "Chris Davis",
        avatar: "/placeholder.svg",
        rating: 5,
        date: "2025-04-02",
        comment: "Sarah is an exceptional teacher. Her coding course was well-structured and she was always available to answer questions."
      },
      {
        id: 2,
        name: "Morgan Lee",
        avatar: "/placeholder.svg",
        rating: 4,
        date: "2025-03-18",
        comment: "Great at explaining complex concepts. I finally understand React hooks thanks to Sarah!"
      }
    ],
    availability: [
      { day: "Tuesday", slots: ["9:00 AM - 10:00 AM", "4:00 PM - 5:00 PM"] },
      { day: "Thursday", slots: ["11:00 AM - 12:00 PM", "3:00 PM - 4:00 PM"] },
      { day: "Saturday", slots: ["10:00 AM - 11:00 AM", "1:00 PM - 2:00 PM"] }
    ]
  },
  // Add more teacher data as needed...
  "67": {
    id: "67",
    name: "Michael Chen",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 4.9,
    location: "Los Angeles, CA",
    company: "Yoga Instructor",
    education: "Certified Yoga Teacher (RYT 500)",
    contact: {
      email: "michael.chen@example.com",
      phone: "+1 (555) 765-4321"
    },
    bio: "Certified yoga instructor with 8 years of experience. I specialize in beginner-friendly approaches to yoga that focus on proper alignment and mindfulness.",
    achievements: ["Featured Teacher", "Wellness Expert"],
    teachingSkills: ["Yoga", "Meditation", "Breathwork", "Flexibility Training"],
    learningSkills: ["Nutrition", "Dance"],
    reviews: [],
    availability: []
  },
  "22": {
    id: "22",
    name: "Jennifer Lopez",
    avatar: "https://randomuser.me/api/portraits/women/22.jpg",
    rating: 4.7,
    location: "Nashville, TN",
    company: "Professional Musician",
    education: "Music Performance, Berklee College of Music",
    contact: {
      email: "jennifer.lopez@example.com",
      phone: "+1 (555) 234-5678"
    },
    bio: "Professional guitarist and music teacher with a passion for helping beginners develop a strong foundation in music theory and guitar technique.",
    achievements: ["Music Expert", "10+ Years Teaching"],
    teachingSkills: ["Guitar", "Music Theory", "Songwriting", "Performance"],
    learningSkills: ["Piano", "Music Production"],
    reviews: [],
    availability: []
  },
  "45": {
    id: "45",
    name: "Pierre Dubois",
    avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    rating: 4.5,
    location: "Chicago, IL",
    company: "Language Instructor",
    education: "French Literature, Sorbonne University",
    contact: {
      email: "pierre.dubois@example.com",
      phone: "+1 (555) 345-6789"
    },
    bio: "Native French speaker with a background in education. I focus on practical language skills for travelers and beginners, with an emphasis on conversation.",
    achievements: ["Language Expert", "Cultural Guide"],
    teachingSkills: ["French", "Language Learning", "Conversation", "Pronunciation"],
    learningSkills: ["Spanish", "Italian"],
    reviews: [],
    availability: []
  },
  "59": {
    id: "59",
    name: "Maria Rodriguez",
    avatar: "https://randomuser.me/api/portraits/women/59.jpg",
    rating: 4.8,
    location: "Miami, FL",
    company: "Culinary Instructor",
    education: "Culinary Arts, Le Cordon Bleu",
    contact: {
      email: "maria.rodriguez@example.com",
      phone: "+1 (555) 456-7890"
    },
    bio: "Professional chef with a passion for teaching home cooking skills. My approach is practical and focused on building confidence in the kitchen.",
    achievements: ["Culinary Expert", "Recipe Developer"],
    teachingSkills: ["Cooking Basics", "Baking", "Meal Prep", "Knife Skills"],
    learningSkills: ["International Cuisine", "Food Photography"],
    reviews: [],
    availability: []
  }
};

const TeacherProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Get teacher data based on ID
  const teacher = id ? teachersData[id] : null;

  // Handle if teacher not found
  if (!teacher) {
    return (
      <ProfileLayout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Teacher not found</h1>
          <p className="mb-8">The teacher you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate("/explore")}>Back to Explore</Button>
        </div>
      </ProfileLayout>
    );
  }

  // Available times for the selected date
  const getAvailableTimesForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const dayName = format(date, 'EEEE'); // Get day name (Monday, Tuesday, etc.)
    const dayData = teacher.availability.find(a => a.day === dayName);
    
    return dayData ? dayData.slots : [];
  };

  const availableTimes = getAvailableTimesForDate(selectedDate);

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Message Sent",
        description: `Your message has been sent to ${teacher.name}.`,
      });
      setMessage("");
      setMessageDialogOpen(false);
    } else {
      toast({
        title: "Empty Message",
        description: "Please enter a message before sending.",
        variant: "destructive"
      });
    }
  };

  const handleBookSession = () => {
    if (selectedTime) {
      toast({
        title: "Session Request Sent",
        description: `Your request for a session on ${format(selectedDate!, 'MMMM d, yyyy')} at ${selectedTime} has been sent to ${teacher.name}.`,
      });
      setSelectedTime(null);
      setBookingDialogOpen(false);
    } else {
      toast({
        title: "No Time Selected",
        description: "Please select a time slot for your session.",
        variant: "destructive"
      });
    }
  };

  return (
    <ProfileLayout>
      <div className="container max-w-6xl py-8">
        <ProfileHeader 
          name={teacher.name}
          avatar={teacher.avatar}
          rating={teacher.rating}
          location={teacher.location}
          company={teacher.company}
          education={teacher.education}
          achievements={teacher.achievements}
          teachingSkills={teacher.teachingSkills}
          learningSkills={teacher.learningSkills}
        />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full justify-start overflow-x-auto">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{teacher.bio}</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle>Student Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {teacher.reviews.length > 0 ? (
                    <div className="space-y-6">
                      {teacher.reviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={review.avatar} alt={`${review.name}'s avatar`} />
                                <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
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
                    <p className="text-muted-foreground text-center py-8">
                      No reviews yet for this teacher.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability">
              <Card>
                <CardHeader>
                  <CardTitle>Book a Session</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium mb-4">Select a date</h3>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">
                        Available times for {selectedDate && format(selectedDate, "MMMM d, yyyy")}
                      </h3>
                      {availableTimes.length > 0 ? (
                        <div className="space-y-2">
                          {availableTimes.map((time, index) => (
                            <div
                              key={index}
                              className={`p-3 border rounded-md cursor-pointer transition-colors flex items-center gap-2 ${
                                selectedTime === time ? "border-skill-purple bg-skill-purple/10" : "hover:bg-muted"
                              }`}
                              onClick={() => setSelectedTime(time)}
                            >
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {time}
                            </div>
                          ))}
                          <div className="pt-4">
                            <Button
                              onClick={() => setBookingDialogOpen(true)}
                              disabled={!selectedTime}
                              className="bg-skill-purple hover:bg-skill-purple-dark w-full md:w-auto"
                            >
                              Book Selected Time
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-muted-foreground border rounded-md">
                          <p className="mb-2">No available times for this date.</p>
                          <p>Please select another date or contact the teacher directly.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">{teacher.contact.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">{teacher.contact.phone}</p>
                      </div>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row gap-3">
                      <Button 
                        onClick={() => setMessageDialogOpen(true)}
                        className="bg-skill-purple hover:bg-skill-purple-dark"
                      >
                        <MessageSquare className="mr-2 h-4 w-4" /> Send Message
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setActiveTab("availability")}
                      >
                        <Video className="mr-2 h-4 w-4" /> Book a Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Message to {teacher.name}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={teacher.avatar} alt={`${teacher.name}'s avatar`} />
                <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{teacher.name}</h4>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                  {teacher.rating.toFixed(1)}
                </div>
              </div>
            </div>

            <textarea
              className="w-full p-3 border rounded-md h-40 resize-none focus:outline-none focus:ring-2 focus:ring-skill-purple"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-skill-purple hover:bg-skill-purple-dark"
                onClick={handleSendMessage}
              >
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Booking Confirmation Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Booking</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={teacher.avatar} alt={`${teacher.name}'s avatar`} />
                <AvatarFallback>{teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">{teacher.name}</h4>
                <p className="text-sm text-muted-foreground">{teacher.teachingSkills[0]}</p>
              </div>
            </div>

            <div className="space-y-4 border rounded-md p-4">
              <div className="flex items-center gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Date & Time</p>
                  <p className="text-muted-foreground">
                    {selectedDate && format(selectedDate, "MMMM d, yyyy")} at {selectedTime}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-skill-purple hover:bg-skill-purple-dark"
                onClick={handleBookSession}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ProfileLayout>
  );
};

export default TeacherProfile;
